import { AdministrativePenaltyAddEditComponent } from './../../../records/administrative-penalties/administrative-penalty-add-edit/administrative-penalty-add-edit.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordUtils } from '../../../records/utils/record-utils';
import { FactoryService } from '../../../services/factory.service';
import { LoadingScreenService, LoggerService } from 'nrpti-angular-components';
import { Utils, StoreService } from 'nrpti-angular-components';
import { ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-mines-administrative-penalty-add-edit',
  templateUrl: './mines-administrative-penalty-add-edit.component.html',
  styleUrls: ['./mines-administrative-penalty-add-edit.component.scss']
})
export class MinesAdministrativePenaltyAddEditComponent extends AdministrativePenaltyAddEditComponent
  implements OnInit {
  public componentTitle = 'BCMI Administrative Penalty Record';
  public defaultAgency = 'Ministry of Energy Mines and Low Carbon Innovation';
  public defaultAuthor = 'BC Government';
  public currentRecord = null;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    protected recordUtils: RecordUtils,
    protected factoryService: FactoryService,
    protected loadingScreenService: LoadingScreenService,
    protected logger: LoggerService,
    protected utils: Utils,
    protected _changeDetectionRef: ChangeDetectorRef,
    // @ts-ignore used by record-association component
    protected storeService: StoreService
  ) {
    super(
      route,
      router,
      recordUtils,
      factoryService,
      loadingScreenService,
      logger,
      utils,
      _changeDetectionRef,
      storeService
    );
  }

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Administrative Penalty';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit mines administrative penalty.');
          this.router.navigate([['mines', 'enforcement-actions']]);
        }
      } else {
        this.currentRecord = {
          sourceSystemRef: 'nrpti',
          documents: [],
          unlistedMine: '',
          legislation: [
            {
              act: 'Mines Act',
              section: '36.2',
              offence: 'Penalty for failure to comply with the Act or associated regulations'
            }
          ]
        };
      }
      super.buildForm();
      super.subscribeToFormControlChanges();
      this.loading = false;
      this._changeDetectionRef.detectChanges();
    });
  }

  navigateToDetails() {
    this.router.navigate(['records', 'administrative-penalties', this.currentRecord._id, 'detail']);
  }

  async submit() {
    // Mark legislation dirty on Add because of default legislation
    if (!this.isEditing) {
      this.myForm.controls.legislations.markAsDirty();
    }

    await super.save();

    if (!this.isEditing) {
      this.router.navigate(['mines', 'enforcement-actions']);
    } else {
      this.router.navigate([
        'mines',
        'enforcement-actions',
        'administrative-penalties',
        this.currentRecord._id,
        'detail'
      ]);
    }
  }

  displayName(agency) {
    return Utils.displayNameFull(agency);
  }

  cancel() {
    const shouldCancel = confirm(
      'Leaving this page will discard unsaved changes. Are you sure you would like to continue?'
    );
    if (shouldCancel) {
      if (!this.isEditing) {
        this.router.navigate(['mines', 'enforcement-actions']);
      } else {
        this.router.navigate([
          'mines',
          'enforcement-actions',
          'administrative-penalties',
          this.currentRecord._id,
          'detail'
        ]);
      }
    }
  }
}
