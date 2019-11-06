import {
  Component,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ApplicationRef,
  ElementRef,
  SimpleChanges,
  Injector,
  ComponentFactoryResolver
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// import { takeUntil, map } from 'rxjs/operators';
import 'leaflet';
import 'leaflet.markercluster';
import _ from 'lodash';
import 'async';
import 'topojson-client';
import 'jquery';

import { Application } from '../../models/application';
import { UrlService } from '../../services/url.service';
import { MarkerPopupComponent } from './marker-popup/marker-popup.component';

declare module 'leaflet' {
  // tslint:disable-next-line:interface-name
  export interface Marker<P = any> {
    dispositionId: number;
  }
}

const L = window['L'];
const async = window['async'];
const topojson = window['topojson'];
const $ = window['jQuery']; // Yeah... I know. But I'm in a hurry

// Make sure layer definitions are global to this component.
const layers: {
  facility: L.GeoJSON<any>;
  facilities: L.GeoJSON<any>;
  pipeline: L.GeoJSON<any>;
  sections: L.GeoJSON<any>;
} = {
  facility: null,
  facilities: null,
  pipeline: null,
  sections: null
};

const markerIcon = L.icon({
  iconUrl: 'assets/images/baseline-location-24px.svg',
  // Retina Icon is not needed here considering we're using an SVG. Enable if you want to change to a raster asset.
  // iconRetinaUrl: 'assets/images/marker-icon-2x-yellow.svg',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  tooltipAnchor: [16, -28]
});

const markerIconLg = L.icon({
  iconUrl: 'assets/images/baseline-location_on-24px.svg',
  // Retina Icon is not needed here considering we're using an SVG. Enable if you want to change to a raster asset.
  // iconRetinaUrl: 'assets/images/marker-icon-yellow-lg.svg',
  iconSize: [48, 48],
  iconAnchor: [24, 48]
  // popupAnchor: [1, -34], // TODO: update, if needed
  // tooltipAnchor: [16, -28] // TODO: update, if needed
});

@Component({
  selector: 'app-map',
  templateUrl: './app-map.component.html',
  styleUrls: ['./app-map.component.scss']
})
export class AppMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() isLoading: boolean; // from applications component
  @Input() applications: Application[] = []; // from applications component
  @Input() isMapVisible: Application[] = []; // from applications component
  @Output() toggleCurrentApp = new EventEmitter(); // to applications component
  @Output() updateCoordinates = new EventEmitter(); // to applications component

  private map: L.Map = null;
  private markerList: L.Marker[] = []; // list of markers
  private currentMarker: L.Marker = null; // for removing previous marker
  private markerClusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 40, // NB: change to 0 to disable clustering
    iconCreateFunction: this.clusterCreate
  });
  // private oldZoom: number = null;
  private isMapReady = false;
  private doNotify = true; // whether to emit notification
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  private mapBaseLayerName = 'World Topographic';

  readonly defaultBounds = L.latLngBounds([53.6, -129.5], [56.1, -120]); // all of BC

  constructor(
    private appRef: ApplicationRef,
    private elementRef: ElementRef,
    public urlService: UrlService,
    private injector: Injector,
    private resolver: ComponentFactoryResolver
  ) {
    this.urlService.onNavEnd$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {});
  }

  // for creating custom cluster icon
  private clusterCreate(cluster): L.Icon | L.DivIcon {
    const childCount = cluster.getChildCount();
    let c = ' marker-cluster-';
    if (childCount < 10) {
      c += 'small';
    } else if (childCount < 100) {
      c += 'medium';
    } else {
      c += 'large';
    }

    return new L.DivIcon({
      html: `<div><span title="${childCount} applications near this location">${childCount}</span></div>`,
      className: 'cluster-marker-count' + c,
      iconSize: new L.Point(48, 48),
      iconAnchor: [25, 46]
    });
  }

  // create map after view (which contains map id) is initialized
  ngAfterViewInit() {
    // custom control to reset map view
    const resetViewControl = L.Control.extend({
      options: {
        position: 'bottomright'
      },
      onAdd: () => {
        const element = L.DomUtil.create('button');

        element.title = 'Reset view';
        element.innerText = 'refresh'; // material icon name
        element.onclick = () => this.resetView();
        element.className = 'material-icons map-reset-control';

        // prevent underlying map actions for these events
        L.DomEvent.disableClickPropagation(element); // includes double-click
        L.DomEvent.disableScrollPropagation(element);

        return element;
      }
    });

    const Esri_OceanBasemap = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          // tslint:disable-next-line:max-line-length
          'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
        maxZoom: 10.4,
        noWrap: true
      }
    );
    const Esri_NatGeoWorldMap = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          // tslint:disable-next-line:max-line-length
          'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
        maxZoom: 16.4,
        noWrap: true
      }
    );
    const World_Topo_Map = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          // tslint:disable-next-line:max-line-length
          'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        maxZoom: 17.5,
        noWrap: true
      }
    );
    const World_Imagery = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          // tslint:disable-next-line:max-line-length
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 16.4,
        noWrap: true
      }
    );

    this.map = L.map('map', {
      zoomControl: false, // will be added manually below
      maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)), // restrict view to "the world"
      minZoom: 2, // prevent zooming out too far
      zoomSnap: 0.1, // for greater granularity when fitting bounds
      attributionControl: false
    });

    // identify when map has initialized with a view
    this.map.whenReady(() => (this.isMapReady = true));

    // this.map.on('movestart', function () {
    //   console.log('movestart');
    // }, this);

    // this.map.on('resize', function () {
    //   console.log('resize');
    // }, this);

    // NB: moveend is called after zoomstart, movestart and resize
    // NB: fitBounds() also ends up here
    this.map.on('moveend', () => {
      // console.log('moveend');

      // notify applications component of updated coordinates
      // const newZoom = this.map.getZoom();
      // const doEmit = newZoom <= this.oldZoom; // ignore zooming in
      // this.oldZoom = newZoom;
      // if (doEmit) { this.emitCoordinates(); }
      if (this.isMapReady && this.doNotify) {
        this.emitCoordinates();
      }
      this.doNotify = true; // reset for next time
    });

    const dataUrls = [
      '/assets/data/facilities-12jun2019.json',
      '/assets/data/facility-29apr2019.json',
      '/assets/data/pipeline-segments-12jun2019.json'
    ];

    const displayData = data => {
      const tooltipOffset = L.point(0, 25);
      const tooltipOffset2 = L.point(0, -5);
      layers.facility = L.geoJSON(data.facility, {
        style: { color: '#6092ff', weight: 2 }
      }).addTo(this.map);

      layers.pipeline = L.geoJSON(data.pipeline, {
        style: { color: '#6092ff', weight: 3 },
        onEachFeature: (feature, featureLayer) => {
          featureLayer.on('click', () => {
            // Open project popup
            layers.facilities.eachLayer((layer: any) => {
              if (layer.feature.properties.LABEL === 'Wilde Lake M/S') {
                layer.openPopup();
              }
            });
          });
          featureLayer.on('mouseover', e => {
            e.target.setStyle({ color: '#00f6ff' });
            $('#gas-button').css('background', '#c4f9ff');
          });
          featureLayer.on('mouseout', e => {
            e.target.setStyle({ color: '#6092ff' });
            $('#gas-button').css('background', '#ffffff');
          });
        }
      })
        .bindTooltip(
          (layer: any) => {
            const p = layer.feature.properties;
            return `Segment ${p.segment}`;
          },
          { direction: 'center', offset: tooltipOffset, sticky: true }
        )
        .addTo(this.map);

      // Add the pipeline segment layer
      // layers.sections = L.geoJSON(data.sections, {
      //   style: { color: '#6092ff', weight: 5 },
      //   onEachFeature: (feature, layer) => {
      //     layer.on('mouseover', e => {
      //       e.target.setStyle({ color: '#00f6ff' });
      //       $('#gas-button').css('background', '#c4f9ff');
      //     });
      //     layer.on('mouseout', e => {
      //       e.target.setStyle({ color: '#6092ff' });
      //       $('#gas-button').css('background', '#ffffff');
      //     });
      //   }
      // })
      //   .bindTooltip(
      //     layer => {
      //       const p = layer.feature.properties;
      //       return `From ${p.from} to ${p.to}.`;
      //     },
      //     { direction: 'top', offset: tooltipOffset }
      //   )
      //   .addTo(this.map);

      // Default marker style
      const markerOptions = {
        radius: 4,
        stroke: true,
        weight: 2,
        color: '#6092ff',
        fill: true,
        fillColor: 'white',
        fillOpacity: 1
      };

      const gasPopup = `
        <div class="popup-header">
          <div class="popup-title">COASTAL GASLINK PIPELINE</div>
          <div class="popup-subtitle">Coastal Gaslink Pipeline Ltd.</div>
        </div>
        <div class="popup-content">
          <div class="popup-desc-title">Application Description</div>
          <div class="popup-desc">
            A 670-kilometer pipeline that will supply the LNG Canada export facility
            with gas from northeastern British Columbia.
          </div>
          <hr class="popup-hr">
          <div class="popup-value"></div>
          <a href="/project/2">
            <div class="popup-button">
              <button type="button" class="btn btn-primary" routerLink="/project/2">
                <i class="material-icons mr-1">image</i>
                <i class="material-icons mr-1">menu</i>
                <span>Go to Details</span>
              </button>
            </div>
          </a>
        </div>
      `;

      const lngPopup = `
        <div class="popup-header">
          <div class="popup-title">LNG CANADA</div>
          <div class="popup-subtitle">LNG Canada</div>
        </div>
        <div class="popup-content">
          <div class="popup-desc-title">Application Description</div>
          <div class="popup-desc">
            A large-scale natural gas processing and export facility located in Kitimat,
            British Columbia. After natural gas is converted into a liquid form it will
            be shipped to Asia and other markets.
          </div>
          <hr class="popup-hr">
          <div class="popup-value"></div>
          <a href="/project/1">
            <div class="popup-button">
              <button type="button" class="btn btn-primary" routerLink="/project/1">
                <i class="material-icons mr-1">image</i>
                <i class="material-icons mr-1">menu</i>
                <span>Go to Details</span>
              </button>
            </div>
          </a>
        </div>
      `;

      layers.facilities = L.geoJSON(data.facilities, {
        pointToLayer: (pointFeature, latlng) => {
          return L.circleMarker(latlng, markerOptions);
        },
        onEachFeature: (feature, featureLayer: any) => {
          // Remove the Meter Station for now
          const popupOptions = {
            className: 'map-popup-content',
            autoPanPaddingTopLeft: L.point(40, 220),
            autoPanPaddingBottomRight: L.point(40, 20)
          };
          switch (featureLayer.feature.properties.LABEL) {
            case 'Vanderhoof Meter Station': {
              featureLayer.setStyle({
                radius: 0,
                stroke: false,
                fill: false
              });
              break;
            }
            case 'Wilde Lake M/S': {
              featureLayer.setStyle({
                radius: 8,
                weight: 3
              });
              const popup = L.popup(popupOptions).setContent(gasPopup);
              featureLayer.bindPopup(popup);
              break;
            }
            case 'Kitimat M/S': {
              featureLayer.setStyle({
                radius: 8,
                weight: 3,
                fillColor: '#a5ff82'
              });
              const popup = L.popup(popupOptions).setContent(lngPopup);
              featureLayer.bindPopup(popup);
              break;
            }
          }

          featureLayer.on('click', e => {
            // Open project popup
            if (
              e.target.feature.properties.LABEL === 'Kitimat M/S' ||
              e.target.feature.properties.LABEL === 'Wilde Lake M/S'
            ) {
              return;
            }
            layers.facilities.eachLayer((layer: any) => {
              if (layer.feature.properties.LABEL === 'Wilde Lake M/S') {
                layer.openPopup();
              }
            });
          });

          featureLayer.on('mouseover', e => {
            e.target.setStyle({ color: '#00f6ff' }); // Highlight geo feature
            if (feature.properties.LABEL === 'Kitimat M/S') {
              // Highlight legend entry
              $('#lng-button').css('background', '#c4f9ff');
            } else {
              $('#gas-button').css('background', '#c4f9ff');
            }
          });

          featureLayer.on('mouseout', e => {
            e.target.setStyle({ color: '#6092ff' }); // Unhighlight geo feature
            if (feature.properties.LABEL === 'Kitimat M/S') {
              // Unhighlight legend entry
              $('#lng-button').css('background', '#ffffff');
            } else {
              $('#gas-button').css('background', '#ffffff');
            }
          });
        }
      })
        .bindTooltip(
          (layer: any) => {
            return layer.feature.properties.LABEL;
          },
          { direction: 'top', offset: tooltipOffset2 }
        )
        .addTo(this.map);
    };

    // map state change events
    // this.map.on(
    //   'zoomend',
    //   () => {
    //     const z = this.map.getZoom();
    //     if (z >= 10) {
    //       if (layers.sections) {
    //         this.map.removeLayer(layers.sections);
    //       }
    //       if (layers.facilities) {
    //         this.map.removeLayer(layers.facilities);
    //       }
    //       if (layers.facility) {
    //         this.map.addLayer(layers.facility);
    //       }
    //       if (layers.pipeline) {
    //         this.map.addLayer(layers.pipeline);
    //       }
    //     } else {
    //       if (layers.sections) {
    //         this.map.addLayer(layers.sections);
    //       }
    //       if (layers.facilities) {
    //         this.map.addLayer(layers.facilities);
    //       }
    //       if (layers.facility) {
    //         this.map.removeLayer(layers.facility);
    //       }
    //       if (layers.pipeline) {
    //         this.map.removeLayer(layers.pipeline);
    //       }
    //     }
    //   },
    //   this
    // );

    // Data collection function
    const getIt = (loc: string, callback: any) => {
      $.get(loc)
        .fail(() => {
          callback(`Failed to fetch ${loc}`);
        })
        .done(data => {
          callback(null, data);
        });
    };

    // Called when all data has been collected
    const getDone = (err: string, data: any) => {
      if (err) {
        return console.error(err);
      } // If there was problem

      const dataGeoJson: any = {}; // This will hold the GeoJSON

      dataGeoJson.facilities = data[0];

      // Convert topojson to geojson
      dataGeoJson.facility = topojson.feature(data[1], data[1].objects['facility-29apr2019']);
      dataGeoJson.pipeline = topojson.feature(data[2], data[2].objects['pipeline-segments']);

      displayData(dataGeoJson);
    };

    // Fetch all layer data in parallel
    async.concat(dataUrls, getIt, getDone);

    // define baselayers
    const baseLayers = {
      'Ocean Base': Esri_OceanBasemap,
      'Nat Geo World Map': Esri_NatGeoWorldMap,
      'World Topographic': World_Topo_Map,
      'World Imagery': World_Imagery
    };

    // add layer control
    // L.control.layers(baseLayers, null, { position: 'topright' }).addTo(this.map);

    // map attribution
    L.control.attribution({ position: 'bottomright' }).addTo(this.map);

    // add scale control
    // L.control.scale({ position: 'bottomleft' }).addTo(this.map);

    // add zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // add reset view control
    this.map.addControl(new resetViewControl());

    // load base layer
    for (const key of Object.keys(baseLayers)) {
      if (key === this.mapBaseLayerName) {
        this.map.addLayer(baseLayers[key]);
        break;
      }
    }

    // save any future base layer changes
    this.map.on('baselayerchange', (e: L.LayersControlEvent) => {
      this.mapBaseLayerName = e.name;
    });

    this.fixMap();
  }

  // to avoid timing conflict with animations (resulting in small map tile at top left of page),
  // ensure map component is visible in the DOM then update it; otherwise wait a bit and try again
  // ref: https://github.com/Leaflet/Leaflet/issues/4835
  // ref: https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
  private fixMap() {
    // console.log('fixing map');
    if (this.elementRef.nativeElement.offsetParent) {
      // try to restore map state
      const lat = this.urlService.query('lat');
      const lng = this.urlService.query('lng');
      const zoom = this.urlService.query('zoom');

      if (lat && lng && zoom) {
        this.map.setView(L.latLng(+lat, +lng), +zoom); // NOTE: unary operators
      } else {
        this.fitBounds(); // default bounds
      }
    } else {
      setTimeout(this.fixMap.bind(this), 50);
    }
  }

  // facility: null,
  // facilities: null,
  // pipeline: null,
  // sections: null

  public ngOnLegendLngClick() {
    layers.facilities.eachLayer((layer: any) => {
      if (layer.feature.properties.LABEL === 'Kitimat M/S') {
        layer.openPopup();
      }
    });
  }

  public ngOnLegendGasClick() {
    layers.facilities.eachLayer((layer: any) => {
      if (layer.feature.properties.LABEL === 'Wilde Lake M/S') {
        layer.openPopup();
      }
    });
  }

  public ngOnLegendLngEnter() {
    // Highlight the facility ... that last dot
    $('#lng-button').css('background', '#c4f9ff');
    layers.facilities.eachLayer((layer: any) => {
      if (layer.feature.properties.LABEL === 'Kitimat M/S') {
        layer.setStyle({ color: '#00f6ff' });
      }
    });
  }
  public ngOnLegendLngLeave() {
    $('#lng-button').css('background', '#ffffff');
    layers.facilities.eachLayer((layer: any) => {
      if (layer.feature.properties.LABEL === 'Kitimat M/S') {
        layer.setStyle({ color: '#6092ff' });
      }
    });
  }

  public ngOnLegendGasEnter() {
    $('#gas-button').css('background', '#c4f9ff');
    layers.facilities.eachLayer((layer: any) => {
      if (layer.feature.properties.LABEL !== 'Kitimat M/S') {
        layer.setStyle({ color: '#00f6ff' });
      }
    });
    layers.pipeline.eachLayer((layer: any) => {
      layer.setStyle({ color: '#00f6ff' });
    });
  }

  public ngOnLegendGasLeave() {
    $('#gas-button').css('background', '#ffffff');
    layers.facilities.eachLayer((layer: any) => {
      if (layer.feature.properties.LABEL !== 'Kitimat M/S') {
        layer.setStyle({ color: '#6092ff' });
      }
    });
    layers.pipeline.eachLayer((layer: any) => {
      layer.setStyle({ color: '#6092ff' });
    });
  }

  // called when apps list changes
  public ngOnChanges(changes: SimpleChanges) {
    // update map only if it's visible
    if (this.isMapVisible) {
      if (changes.applications && !changes.applications.firstChange && changes.applications.currentValue) {
        // console.log('map: got changed apps =', changes.applications);

        const deletedApps = _.differenceBy(
          changes.applications.previousValue as Application[],
          changes.applications.currentValue as Application[],
          '_id'
        );
        const addedApps = _.differenceBy(
          changes.applications.currentValue as Application[],
          changes.applications.previousValue as Application[],
          '_id'
        );
        // console.log('deleted =', deletedApps);
        // console.log('added =', addedApps);

        // (re)draw the matching apps
        this.drawMap(deletedApps, addedApps);
      }
    }
  }

  // when map becomes visible, draw all apps
  // TODO: or just emit current bounds and cause a reload?
  public onMapVisible() {
    // delete any old apps
    this.markerList.forEach(marker => {
      this.markerClusterGroup.removeLayer(marker);
    });
    this.markerList = []; // empty the list

    // draw all new apps
    this.drawMap([], this.applications);
  }

  public ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Resets map view.
   */
  public resetView(doNotify: boolean = true) {
    // console.log('resetting view');
    this.doNotify = doNotify;
    this.fitBounds(); // default bounds

    // FUTURE
    // // clear map state
    // this.urlService.save('lat', null);
    // this.urlService.save('lng', null);
    // this.urlService.save('zoom', null);
    // this.emitCoordinates();
  }

  /**
   * Emits an event to notify applications component of updated coordinates.
   * Debounced function executes when 250ms have elapsed since last call.
   */
  // tslint:disable-next-line:member-ordering
  private emitCoordinates = _.debounce(() => {
    this.updateCoordinates.emit();
  }, 250);

  /**
   * Returns coordinates in GeoJSON format that specify map bounding box.
   */
  public getCoordinates(): string {
    let bounds: L.LatLngBounds;
    if (this.isMapReady && this.elementRef.nativeElement.offsetParent) {
      // actual bounds
      bounds = this.map.getBounds();
    } else {
      // map not ready yet - use default
      bounds = this.defaultBounds;
    }

    // use min/max to protect API from invalid bounds
    const west = Math.max(bounds.getWest(), -180);
    const south = Math.max(bounds.getSouth(), -90);
    const east = Math.min(bounds.getEast(), 180);
    const north = Math.min(bounds.getNorth(), 90);

    // return box parameters
    return `[[${this.latLngToCoord(south, west)},${this.latLngToCoord(north, east)}]]`;
  }

  private latLngToCoord(lat: number, lng: number): string {
    return `[${lng},${lat}]`;
  }

  // NB: do not animate fitBounds() as it can lead to getting
  // the latest apps BEFORE the final coordinates are set
  private fitBounds(bounds: L.LatLngBounds = null) {
    // console.log('fitting bounds');
    const fitBoundsOptions: L.FitBoundsOptions = {
      animate: false,
      paddingTopLeft: [0, 100],
      paddingBottomRight: [0, 20]
    };
    if (bounds && bounds.isValid()) {
      this.map.fitBounds(bounds, fitBoundsOptions);
    } else {
      this.map.fitBounds(this.defaultBounds, fitBoundsOptions);
    }
  }

  /**
   * Removes deleted / draws added applications.
   */
  private drawMap(deletedApps: Application[], addedApps: Application[]) {
    console.log('drawing map');

    // remove deleted apps from list and map
    deletedApps.forEach(app => {
      const markerIndex = _.findIndex(this.markerList, { dispositionId: app.tantalisID });
      if (markerIndex >= 0) {
        const markers = this.markerList.splice(markerIndex, 1);
        this.markerClusterGroup.removeLayer(markers[0]);
      }
    });

    // draw added apps
    addedApps.forEach(app => {
      // add marker
      if (app.centroid.length === 2) {
        // safety check
        // derive unique applicants
        if (app.client) {
          const clients = app.client.split(', ');
          app['applicants'] = _.uniq(clients).join(', ');
        }
        const title =
          `${app['applicants'] || 'Applicant Name Not Available'}\n` +
          `${app.purpose || '-'} / ${app.subpurpose || '-'}\n` +
          `${app.location || 'Location Not Available'}\n`;
        const marker = L.marker(L.latLng(app.centroid[1], app.centroid[0]), { title: title })
          .setIcon(markerIcon)
          .on('click', L.Util.bind(this.onMarkerClick, this, app));
        marker.dispositionId = app.tantalisID;
        this.markerList.push(marker); // save to list
        this.markerClusterGroup.addLayer(marker); // save to marker clusters group
      }
    });
  }

  // called when user clicks on app marker

  // update selected item in app list
  // this.toggleCurrentApp.emit(app); // DO NOT TOGGLE LIST ITEM AT THIS TIME

  // called when user clicks on app marker
  private onMarkerClick(...args: any[]) {
    const app = args[0] as Application;
    const marker = args[1].target as L.Marker;

    // update selected item in app list
    // this.toggleCurrentApp.emit(app); // DO NOT TOGGLE LIST ITEM AT THIS TIME

    // if there's already a popup, delete it
    let popup = marker.getPopup();
    if (popup) {
      const wasOpen = popup.isOpen();
      popup.remove();
      marker.unbindPopup();
      if (wasOpen) {
        return;
      }
    }

    const popupOptions = {
      className: 'map-popup-content',
      autoPanPaddingTopLeft: L.point(40, 300),
      autoPanPaddingBottomRight: L.point(40, 20)
    };

    // compile marker popup component
    const compFactory = this.resolver.resolveComponentFactory(MarkerPopupComponent);
    const compRef = compFactory.create(this.injector);
    compRef.instance.id = app._id;
    this.appRef.attachView(compRef.hostView);
    compRef.onDestroy(() => this.appRef.detachView(compRef.hostView));
    const div = document.createElement('div').appendChild(compRef.location.nativeElement);

    popup = L.popup(popupOptions)
      .setLatLng(marker.getLatLng())
      .setContent(div);

    // bind popup to marker so it automatically closes when marker is removed
    marker.bindPopup(popup).openPopup();
  }

  /**
   * Called when an app is selected or unselected.
   */
  public async onHighlightApplication(app: Application, show: boolean) {
    // reset icon on previous marker, if any
    if (this.currentMarker) {
      this.currentMarker.setIcon(markerIcon);
      this.currentMarker = null;
    }

    // set icon on new marker
    if (show && app) {
      // safety check
      // wait for apps to finish loading
      // ref: https://basarat.gitbooks.io/typescript/docs/async-await.html
      while (this.isLoading) {
        await this.delay(100);
      }

      const marker = _.find(this.markerList, { dispositionId: app.tantalisID });
      if (marker) {
        this.currentMarker = marker;
        marker.setIcon(markerIconLg);
        const visibleParent = this.markerClusterGroup.getVisibleParent(marker);
        // if marker is in a cluster, zoom into it
        if (marker !== visibleParent) {
          this.markerClusterGroup.zoomToShowLayer(marker);
        }
        // if not already open, show popup
        if (!marker.getPopup() || !marker.getPopup().isOpen()) {
          this.onMarkerClick(app, { target: marker });
        }
      }
    }
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, milliseconds));
  }
}
