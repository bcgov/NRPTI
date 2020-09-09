import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { FormGroup, FormControl } from '@angular/forms';
import { CommunicationsPackage } from '../../../../common/src/app/models/master/common-models/communications-package';
import { FactoryService } from '../services/factory.service';
import { DatePickerComponent, LoadingScreenService, Utils } from 'nrpti-angular-components';

@Component({
  selector: 'communications-add',
  templateUrl: './communications.component.html',
  styleUrls: ['./communications.component.scss']
})
export class CommunicationsComponent implements OnInit, OnDestroy {
  @ViewChild(DatePickerComponent) DatePicker: DatePickerComponent;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public myForm: FormGroup;

  public commPackage: CommunicationsPackage;
  public selectedApplication: string;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private factoryService: FactoryService,
    private utils: Utils,
    private loadingScreenService: LoadingScreenService
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
