import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FactoryService } from '../../services/factory.service';
import { LoadingScreenService } from 'nrpti-angular-components';
import { Constants } from '../../utils/constants/misc';
// import { MapInfo } from './../../../../../common/src/app/models/master/common-models/map-info';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-lng-map-info',
  templateUrl: './lng-map-info.component.html',
  styleUrls: ['./lng-map-info.component.scss']
})
export class LngMapInfoComponent implements OnInit, OnDestroy {
  // @Input() lngMapData: MapInfo[] = [];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public mapForm: FormGroup;
  public currentSection = null;
  public lngMapData = [];

  public sections = Constants.LngSectionPickList;

  public tinyMceSettings = {
    base_url: '/tinymce',
    suffix: '.min',
    browser_spellcheck: true,
    height: 240,
    plugins: ['lists, advlist, link'],
    toolbar: [ 'undo redo | formatselect | ' +
    ' bold italic backcolor | alignleft aligncenter ' +
    ' alignright alignjustify | bullist numlist outdent indent |' +
    ' removeformat | help' ]
  };

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private factoryService: FactoryService,
    private loadingScreenService: LoadingScreenService,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.router.onSameUrlNavigation = 'reload';
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (res && res.lngMapData && res.lngMapData[0] && res.lngMapData[0].data) {
        this.lngMapData = res.lngMapData[0].data.searchResults;
      } else {
        alert('Error: could not load LNG Map data');
      }
    });
    this.currentSection = this.lngMapData[0];
    this.buildForm();
  }

  checkRoles() {
    if (this.factoryService.userInRole('sysadmin')) {
      return true;
    } else if (this.factoryService.userInLngRole()) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * When selecting a segment, update the form with it's corresponding data
   *
   * @param {object} event
   * @returns
   * @memberof LngMapInfoComponent
   */
  onSelectSegment(event) {
    if (!event) {
      return;
    }
    const segment = event.target.value.split(': ');
    this.currentSection = this.lngMapData.find(elem => elem.segment === segment[1]);
    this.buildForm();
    this._changeDetectionRef.detectChanges();
  }

  private buildForm() {
    this.mapForm = new FormGroup({
      sectionNumber: new FormControl({
        value: (this.currentSection && this.currentSection.segment) || '',
        disabled: !this.checkRoles()
      }),
      location: new FormControl({
        value: (this.currentSection && this.currentSection.location) || '',
        disabled: !this.checkRoles()
      }),
      length: new FormControl({
        value: (this.currentSection && this.currentSection.length) || '',
        disabled: !this.checkRoles()
      }),
      recentUpdates: new FormControl({
        value: (this.currentSection && this.currentSection.description) || '',
        disabled: !this.checkRoles()
      })
    });
  }

  async submit() {
    this.loadingScreenService.setLoadingState(true, 'main');

    if (
      !this.mapForm.get('location').value ||
      !this.mapForm.get('length').value ||
      !this.mapForm.get('recentUpdates').value
    ) {
      alert('Please ensure your updates to the Section info are complete');
      this.loadingScreenService.setLoadingState(false, 'main');
      return;
    }

    const mapInfo = {};
    // currently we only allow edit on existing sections
    mapInfo['_id'] = this.currentSection._id;
    this.mapForm.controls.sectionNumber.dirty && (mapInfo['segment'] = this.mapForm.controls.sectionNumber.value);
    this.mapForm.controls.location.dirty && (mapInfo['location'] = this.mapForm.controls.location.value);
    this.mapForm.controls.length.dirty && (mapInfo['length'] = this.mapForm.controls.length.value);
    this.mapForm.controls.recentUpdates.dirty && (mapInfo['description'] = this.mapForm.controls.recentUpdates.value);

    const res = await this.factoryService.updateMapLayerInfo(mapInfo);
    if (!res || !res._id) {
      alert('Failed to update the LNG Section');
    } else {
      this.currentSection.sectionNumber = this.mapForm.controls.sectionNumber.value;
      this.currentSection.location = this.mapForm.controls.location.value;
      this.currentSection.length = this.mapForm.controls.length.value;
      this.currentSection.description = this.mapForm.controls.recentUpdates.value;
      this.loadingScreenService.setLoadingState(false, 'main');
    }
  }

  async cancel() {
    // reset form values
    this.buildForm();
    this._changeDetectionRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
