import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FactoryService } from '../../services/factory.service';
import { LoadingScreenService } from 'nrpti-angular-components';
import { Constants } from '../../utils/constants/misc';
import { MapInfo } from './../../../../../common/src/app/models/master/common-models/map-info';
import { Router } from '@angular/router';
@Component({
  selector: 'app-lng-map-info',
  templateUrl: './lng-map-info.component.html',
  styleUrls: ['./lng-map-info.component.scss']
})
export class LngMapInfoComponent implements OnInit {
  @Input() lngMapData: MapInfo[] = [];

  public loading = true;
  public mapForm: FormGroup;
  public currentSection = null;

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
    public router: Router,
    private factoryService: FactoryService,
    private loadingScreenService: LoadingScreenService,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
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
      this.loadingScreenService.setLoadingState(false, 'main');
    }

    this.router.navigate(['communications', 'LNG']);
  }

  async cancel() {
    // reset form values
    this.buildForm();
    this._changeDetectionRef.detectChanges();
  }

}
