import { LngMapInfoComponent } from './lng-map-info/lng-map-info.component';
import { Component, OnInit, OnDestroy, ViewChild, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { FormGroup, FormControl } from '@angular/forms';
import { CommunicationsPackage } from '../../../../common/src/app/models/master/common-models/communications-package';
import { MapInfo } from './../../../../common/src/app/models/master/common-models/map-info';
import { FactoryService } from '../services/factory.service';
import { DatePickerComponent, LoadingScreenService, Utils } from 'nrpti-angular-components';

@Component({
  selector: 'communications-add',
  templateUrl: './communications.component.html',
  styleUrls: ['./communications.component.scss']
})
export class CommunicationsComponent implements OnInit, OnDestroy {
  @ViewChild(DatePickerComponent) DatePicker: DatePickerComponent;
  @ViewChild(LngMapInfoComponent) LngMapInfoComponent: LngMapInfoComponent;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public resetDates: EventEmitter<void> = new EventEmitter<void>();
  public selectedApp: EventEmitter<void> = new EventEmitter<void>();

  public myForm: FormGroup;

  public commPackage: CommunicationsPackage;
  public lngMapInfo: MapInfo;
  public selectedApplication: string;

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
    private utils: Utils,
    private loadingScreenService: LoadingScreenService,
  ) {}

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.commPackage = res.communicationsPackage.COMMUNICATIONS;
      this.selectedApplication = this.route.snapshot.params.application.toUpperCase();
      this.buildForm();
    });
  }

  private buildForm() {
    this.myForm = new FormGroup({
      popupTitle: new FormControl({
        value: (this.commPackage && this.commPackage.title) || '',
        disabled: !this.checkRoles()
      }),
      description: new FormControl({
        value: (this.commPackage && this.commPackage.description) || '',
        disabled: !this.checkRoles()
      }),
      startDate: new FormControl({
        value: (this.commPackage &&
          this.commPackage.startDate &&
          this.utils.convertJSDateToNGBDate(new Date(this.commPackage.startDate))) ||
        '',
        disabled: !this.checkRoles()
      }),
      endDate: new FormControl({
        value: (this.commPackage &&
          this.commPackage.endDate &&
          this.utils.convertJSDateToNGBDate(new Date(this.commPackage.endDate))) ||
        '',
        disabled: !this.checkRoles()
      })
    });
  }

  async submit() {
    // save the popup
    this.loadingScreenService.setLoadingState(true, 'main');

    if (
      !this.myForm.get('popupTitle').value ||
      !this.myForm.get('description').value
    ) {
      alert('Please ensure your Communication Package includes a title and a description.');
      return;
    }

    const popup = {};

    popup['title'] = this.myForm.get('popupTitle').value;
    popup['description'] = this.myForm.get('description').value;
    popup['startDate'] = this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('startDate').value);
    popup['endDate'] = this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('endDate').value);
    popup['application'] = this.selectedApplication;

    this.factoryService.createCommunicationPackage(popup).subscribe(async (res: any) => {
      this.loadingScreenService.setLoadingState(false, 'main');
    });
  }

  async cancel() {
    this.loadingScreenService.setLoadingState(true, 'main');

    const popup = {};

    // Use the original values and save them without dates. This will cancel the popup.
    popup['title'] = this.commPackage.title;
    popup['description'] = this.commPackage.description;
    popup['startDate'] = null;
    popup['endDate'] = null;
    popup['application'] = this.selectedApplication;

    this.factoryService.createCommunicationPackage(popup).subscribe(async (res: any) => {
      this.loadingScreenService.setLoadingState(false, 'main');
      this.resetDates.emit();
    });
  }


  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  checkRoles() {
    if (this.factoryService.userInRole('sysadmin')) {
      return true;
    } else if (this.factoryService.userInLngRole() && this.selectedApplication === 'LNG') {
      return true;
    } else if (this.factoryService.userInNrcedRole() && this.selectedApplication === 'NRCED') {
      return true;
    } else if (this.factoryService.userInBcmiRole() && this.selectedApplication === 'BCMI') {
      return true;
    } else {
      return false;
    }
  }
}
