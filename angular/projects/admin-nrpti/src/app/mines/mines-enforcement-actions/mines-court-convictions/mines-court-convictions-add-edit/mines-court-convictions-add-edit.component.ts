import { CourtConvictionAddEditComponent } from '../../../../records/court-convictions/court-conviction-add-edit/court-conviction-add-edit.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordUtils } from '../../../../records/utils/record-utils';
import { FactoryService } from '../../../../services/factory.service';
import { LoadingScreenService, LoggerService } from 'nrpti-angular-components';
import { Utils, StoreService } from 'nrpti-angular-components';
import { ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-mines-court-convictions-add-edit',
  templateUrl: './mines-court-convictions-add-edit.component.html',
  styleUrls: [
    '../../../../records/court-convictions/court-conviction-add-edit/court-conviction-add-edit.component.scss'
  ]
})
export class MinesCourtConvictionsAddEditComponent extends CourtConvictionAddEditComponent implements OnInit {
  public componentTitle = 'BCMI Administrative Penalty Record';
  public defaultAgency = 'Ministry of Energy Mines and Low Carbon Innovation';
  public defaultAuthor = 'BC Government';
  public currentRecord = null;

  private selectedConvictionInfoType = '';

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
      this.isEditing = res.breadcrumb !== 'Add Court Conviction';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.currentRecord = res.record[0].data;
          this.populateTextFields();
        } else {
          alert('Error: could not load edit mines court conviction.');
          this.router.navigate([['mines', 'enforcement-actions']]);
        }
      } else {
        this.currentRecord = {
          sourceSystemRef: 'nrpti',
          documents: [],
          unlistedMine: ''
        };
      }

      super.buildForm();
      this.setRadioButtonSelection();
      this.subscribeToFormControlChanges();
      this.loading = false;
      this._changeDetectionRef.detectChanges();
    });
  }

  private setRadioButtonSelection() {
    if (this.currentRecord && this.currentRecord.documents.length > 0) {
      this.selectedConvictionInfoType = 'url';
    } else if (this.currentRecord && this.bcmiFlavour && this.bcmiFlavour.description) {
      this.selectedConvictionInfoType = 'text';
    }

    this.myForm.get('convictionInfoType').setValue(this.selectedConvictionInfoType);
  }

  protected subscribeToFormControlChanges() {
    this.myForm
      .get('convictionInfoType')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(val => {
        if (this.selectedConvictionInfoType && val !== this.selectedConvictionInfoType) {
          const shouldCancel = confirm(
            'Cancelling will discard unsaved changes. Are you sure you would like to continue?'
          );
          if (!shouldCancel) {
            this.myForm.get('convictionInfoType').setValue(this.selectedConvictionInfoType);
            // Hack to make radio button checked properly.  Without this hack the mouse click on the cancel button
            // bugs out the checked radio button and make the UI display it incorrectly
            setTimeout(() => {
              this.myForm.get('convictionInfoType').setValue(this.selectedConvictionInfoType);
            }, 1);
          } else {
            this.selectedConvictionInfoType = val;
            this.myForm.get('convictionInfoType').setValue(val);

            if (val === 'url') {
              // Switching to url from text so reset staged prosecution text here
              this.resetStagedProsecutionText();
            } else {
              // Switching from text to url so reset staged documents and links here
              this.resetStagedLinks();
            }
          }
        } else {
          this.selectedConvictionInfoType = val;
        }
      });
  }

  private resetStagedLinks() {
    this.documents = [];
    this.links = [];
    this.documentsToDelete = [];
  }

  private resetStagedProsecutionText() {
    this.myForm.controls['bcmiDescription'].reset((this.bcmiFlavour && this.bcmiFlavour.description) || '');
    this.myForm.controls['nrcedSummary'].reset((this.nrcedFlavour && this.nrcedFlavour.summary) || '');
  }

  navigateToDetails() {
    this.router.navigate(['records', 'court-convictions', this.currentRecord._id, 'detail']);
  }

  async submit() {
    // Set NRCED summary equal to BCMI description and mark it dirty if necessary
    if (this.myForm.controls.bcmiDescription.dirty) {
      this.myForm.get('nrcedSummary').setValue(this.myForm.controls.bcmiDescription.value);
      this.myForm.controls.nrcedSummary.markAsDirty();
    }

    await super.save();

    if (!this.isEditing) {
      this.router.navigate(['mines', 'enforcement-actions']);
    } else {
      this.router.navigate(['mines', 'enforcement-actions', 'court-convictions', this.currentRecord._id, 'detail']);
    }
  }

  cancel() {
    const shouldCancel = confirm(
      'Leaving this page will discard unsaved changes. Are you sure you would like to continue?'
    );
    if (shouldCancel) {
      if (!this.isEditing) {
        this.router.navigate(['mines', 'enforcement-actions']);
      } else {
        this.router.navigate(['mines', 'enforcement-actions', 'court-convictions', this.currentRecord._id, 'detail']);
      }
    }
  }
}
