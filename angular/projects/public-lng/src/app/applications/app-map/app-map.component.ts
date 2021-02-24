import { Component, AfterViewInit, OnDestroy, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// import { takeUntil, map } from 'rxjs/operators';
import 'leaflet';
import 'leaflet.markercluster';
import 'async';
import 'topojson-client';
import 'jquery';

import { Application } from '../../models/application';
import { UrlService } from '../../services/url.service';

declare module 'leaflet' {
  // tslint:disable-next-line:interface-name
  export interface Marker<P = any> {
    dispositionId: number;
  }

  // tslint:disable-next-line:interface-name
  export interface RendererOptions {
    tolerance: number;
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
  labels: L.LatLng[];
} = {
  facility: null,
  facilities: null,
  pipeline: null,
  sections: null,
  labels: null
};

const minimapLayers = { ...layers };

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
export class AppMapComponent implements AfterViewInit, OnDestroy {
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
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  private minimapCenter = [54.014438, -128.682595];
  private minimapZoom = 12;

  private mapBaseLayerName = 'World Topographic';

  readonly defaultBounds = L.latLngBounds([53.6, -129.5], [56.1, -120]); // all of BC

  constructor(
    // private appRef: ApplicationRef,
    private elementRef: ElementRef,
    public urlService: UrlService
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

    // leaflet minimap needs its own layer to operate on to avoid "strange behaviour"
    const Minimap_Topo_Map = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          // tslint:disable-next-line:max-line-length
          'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
        maxZoom: 17.5,
        noWrap: true
      }
    );

    this.map = L.map('map', {
      zoomControl: false, // will be added manually below
      maxBounds: L.latLngBounds(L.latLng(63, -141), L.latLng(46, -110)), // restrict view to "the world"
      minZoom: 5, // prevent zooming out too far
      zoomSnap: 0.1, // for greater granularity when fitting bounds
      attributionControl: false,
      renderer: L.canvas({ tolerance: 15 })
    });

    // identify when map has initialized with a view
    this.map.whenReady(() => (this.isMapReady = true));

    const dataUrls = [
      '/assets/data/facilities-12jun2019.json',
      '/assets/data/facility-29apr2019.json',
      '/assets/data/pipeline-segments-12jun2019.json'
    ];

    class FacilityPoint {
      latlng;
      facilityName;
      constructor(latlng, facilityName) {
        this.latlng = latlng;
        this.facilityName = facilityName;
      }
    }

    const segmentLabelStyle = `
    width: 24px;
    height: 24px;
    margin-top: -12px;
    font-size: 12px;
    border-radius: 18px;
    border: 2px solid #FCBA19;
    text-align: center;
    background: lightgrey;
    z-index: -501;
    padding-left: 4px;
    padding-right: 4px;
    cursor: grab;
    `;

    const displayData = data => {
      const tooltipOffset = L.point(0, 25);
      const tooltipOffset2 = L.point(0, -5);

      const facilitiesOrder = [
        'Wilde Lake M/S',
        'Sukunka Falls C/S',
        'Mount Bracey C/S',
        'Racoon Lake C/S',
        'Clear Creek C/S',
        'Segundo Lake C/S',
        'Goosly Falls C/S',
        'Titanium Peak C/S',
        'Kitimat M/S'
      ];

      const pipelineEndpoints = [];

      layers.facility = L.geoJSON(data.facility, {
        style: { color: '#6092ff', weight: 2 },
        onEachFeature: (feature, featureLayer) => {
          featureLayer.on('mouseover', e => {
            this.ngOnLegendLngEnter();
          });
          featureLayer.on('mouseout', e => {
            this.ngOnLegendLngLeave();
          });
        }
      }).addTo(this.map);

      layers.pipeline = L.geoJSON(data.pipeline, {
        // style alternating segment colours
        style: feature => {
          switch (feature.properties.segment % 2 === 0) {
            case true:
              return { color: '#38598A' };
            default:
              return { color: '#3B99FC' };
          }
        },
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
            e.target.setStyle({ color: e.target.feature.properties.segment % 2 === 0 ? '#38598A' : '#3B99FC' });
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

      // Default marker style
      const markerOptions = {
        radius: 4,
        stroke: true,
        weight: 2,
        color: '#38598A',
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
      L.geoJSON(data.facilities, {
        pointToLayer: (geoJsonPoint, latlng) => {
          if (
            geoJsonPoint.properties.LABEL !== 'Wilde Lake C/S' &&
            geoJsonPoint.properties.LABEL !== 'Vanderhoof Meter Station'
          ) {
            pipelineEndpoints.push(new FacilityPoint(latlng, geoJsonPoint.properties.LABEL));
            return null;
          }
        }
      });

      layers.labels = this.orderFacilities(facilitiesOrder, pipelineEndpoints);
      layers.labels.forEach((segment, index) => {
        L.marker(segment, {
          icon: L.divIcon({
            iconSize: null,
            // without a dummy class, the default leaflet icon appears
            className: 'map-dummy-class',
            // classes imported from other files do not currently work here
            html: `<span style="${segmentLabelStyle}">${index + 1}</span>`
          })
        }).addTo(this.map);
      });

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
                fillColor: '#a5ff82',
                color: '#38598A'
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
            e.target.setStyle({ color: '#38598A' }); // Unhighlight geo feature
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

    // make geoJSON data available for the minimap
    const displayMiniMapData = data => {
      (minimapLayers.facility = L.geoJSON(data.facility, {
        style: { color: '#6092ff', weight: 2 },
        onEachFeature: (feature, featureLayer) => {
          featureLayer.on('mouseover', e => {
            this.ngOnLegendLngEnter();
          });
          featureLayer.on('mouseout', e => {
            this.ngOnLegendLngLeave();
          });
        }
      })),
        (minimapLayers.facilities = L.geoJSON(data.facilities, {
          style: { color: '#6092ff', weight: 2 }
        })),
        (minimapLayers.pipeline = L.geoJSON(data.pipeline, {
          style: { color: '#38598A', weight: 2 }
        })),
        this.map.addControl(new MiniMapWrapper());
    };

    // Add minimap. Modified from https://github.com/Norkart/Leaflet-MiniMap/
    const MiniMapWrapper = L.Control.extend({
      options: {
        position: 'bottomleft',
        layers: minimapLayers,
        center: this.minimapCenter,
        zoom: this.minimapZoom
      },

      onAdd: function(map) {
        this._mainMap = map;

        this._container = L.DomUtil.create('div', 'leaflet-custom-minimap');
        this._container.title = 'Go to LNG Canada - Facility';
        this._container.onclick = () => this._mainMap.flyTo(this.options.center, this.options.zoom + 1.5);
        L.DomEvent.disableClickPropagation(this._container);
        L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);

        const minimapOptions = {
          dragging: false,
          zoomControl: false,
          attributionControl: false,
          doubleClickZoom: false,
          minZoom: this.options.zoom,
          maxZoom: this.options.zoom
        };

        this._miniMap = new L.Map(this._container, minimapOptions);
        this.options.layers.facility.addTo(this._miniMap);
        this.options.layers.pipeline.addTo(this._miniMap);
        this._miniMap.addLayer(Minimap_Topo_Map);

        return this._container;
      },

      addTo: function(map) {
        L.Control.prototype.addTo.call(this, map);
        this._miniMap.setView(this.options.center, 12);
        return this;
      }
    });

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
      displayMiniMapData(dataGeoJson);
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
      minimapLayers.facility.eachLayer((layer: any) => {
        layer.setStyle({ color: '#00f6ff' });
      });
    });
    layers.facility.eachLayer((layer: any) => {
      layer.setStyle({ color: '#00f6ff' });
    });
    minimapLayers.facility.eachLayer((layer: any) => {
      layer.setStyle({ color: '#00f6ff' });
    });
  }
  public ngOnLegendLngLeave() {
    $('#lng-button').css('background', '#ffffff');
    layers.facilities.eachLayer((layer: any) => {
      if (layer.feature.properties.LABEL === 'Kitimat M/S') {
        layer.setStyle({ color: '#38598A' });
      }
      layers.facility.eachLayer((layer: any) => {
        layer.setStyle({ color: '#6092ff' });
      });
      minimapLayers.facility.eachLayer((layer: any) => {
        layer.setStyle({ color: '#6092ff' });
      });
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
        layer.setStyle({ color: '#38598A' });
      }
    });
    layers.pipeline.eachLayer((layer: any) => {
      layer.setStyle({ color: layer.feature.properties.segment % 2 === 0 ? '#38598A' : '#3B99FC' });
    });
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
    this.fitBounds(); // default bounds
  }

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

  private getSegmentMidpoint(data) {
    let index = 1;
    let latMid: number = null;
    let lngMid: number = null;
    const orderedLatLngs: L.LatLng[] = [];
    while (index < data.length) {
      latMid = data[index - 1].latlng.lat + (data[index].latlng.lat - data[index - 1].latlng.lat) / 2;
      lngMid = data[index - 1].latlng.lng + (data[index].latlng.lng - data[index - 1].latlng.lng) / 2;
      orderedLatLngs.push(new L.LatLng(latMid, lngMid));
      index++;
    }
    return orderedLatLngs;
  }

  private orderFacilities(facilitiesOrder, pipelineEndpoints) {
    const orderedFacilites = [];
    let i = 0;
    facilitiesOrder.forEach(facility => {
      do {
        if (facility === pipelineEndpoints[i].facilityName) {
          orderedFacilites.push(pipelineEndpoints[i]);
          pipelineEndpoints.splice(i, 1);
          break;
        }
        i++;
      } while (i < pipelineEndpoints.length);
      i = 0;
    });
    return this.getSegmentMidpoint(orderedFacilites);
  }

  private latLngToCoord(lat: number, lng: number): string {
    return `[${lng},${lat}]`;
  }

  // NB: do not animate fitBounds() as it can lead to getting
  // the latest apps BEFORE the final coordinates are set
  private fitBounds(bounds: L.LatLngBounds = null) {
    const fitBoundsOptions: L.FitBoundsOptions = {
      animate: false,
      paddingTopLeft: [250, 100],
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
    // remove deleted apps from list and map
    deletedApps.forEach(app => {
      const markerIndex = this.markerList.findIndex(element => {
        return JSON.stringify(element) === JSON.stringify({ dispositionId: app.tantalisID });
      });
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
          app['applicants'] = Array.from(new Set(clients)).join(', ');
        }
      }
    });
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

      const marker = this.markerList.find(element => {
        return JSON.stringify(element) === JSON.stringify({ dispositionId: app.tantalisID });
      });
      if (marker) {
        this.currentMarker = marker;
        marker.setIcon(markerIconLg);
        const visibleParent = this.markerClusterGroup.getVisibleParent(marker);
        // if marker is in a cluster, zoom into it
        if (marker !== visibleParent) {
          this.markerClusterGroup.zoomToShowLayer(marker);
        }
        // if not already open, show popup
        // if (!marker.getPopup() || !marker.getPopup().isOpen()) {
        //   this.onMarkerClick(app, { target: marker });
        // }
      }
    }
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, milliseconds));
  }
}
