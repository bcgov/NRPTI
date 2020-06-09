import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { FormGroup, FormControl } from '@angular/forms';
import { LoadingScreenService } from 'nrpti-angular-components';
import { Mine } from '../../../../../common/src/app/models/bcmi/mine';
import { FactoryService } from '../../services/factory.service';

@Component({
  selector: 'app-mines-add-edit',
  templateUrl: './mines-add-edit.component.html',
  styleUrls: ['./mines-add-edit.component.scss']
})
export class MinesAddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public isEditing = false;
  public record;
  public myForm: FormGroup;
  public lastEditedSubText = null;

  // Flavour data
  public nrcedFlavour = null;
  public lngFlavour = null;
  public lngPublishSubtext = 'Not published';
  public nrcedPublishSubtext = 'Not published';

  // mine types
  public types = ['Coal', 'Metal', 'Industrial Mineral', 'Sand & Gravel'];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private factoryService: FactoryService,
    private loadingScreenService: LoadingScreenService,
    private _changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add Mine';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.record = new Mine(res.record[0].data);
        } else {
          alert('Error: could not load edit mine.');
          this.router.navigate(['/']);
        }
      } else {
        // Add
        if (res && res.record) {
          this.record = new Mine(res.record);
        }
      }
      this.buildForm();
      this.loading = false;
      this._changeDetectionRef.detectChanges();
    });
  }

  private buildForm() {
    this.myForm = new FormGroup({
      description: new FormControl((this.record && this.record.description) || ''),
      summary:     new FormControl((this.record && this.record.summary) || ''),
      type:        new FormControl((this.record && this.record.type) || ''),
      links:       new FormControl((this.record && this.record.links.join()) || '')
    });
  }

  compareTypeSelection(optionA: any, optionB: any): boolean {
    return optionA === optionB;
  }

  navigateBack() {
    if (this.isEditing) {
      this.router.navigate(['mines', this.record._id, 'detail']);
    } else {
      this.router.navigate(['mines']);
    }
  }

  async submit() {
    this.loadingScreenService.setLoadingState(true, 'main');
    const mineItem = {};
    mineItem['_id']                  = this.record._id;
    mineItem['_schemaName']          = this.record._schemaName;
    mineItem['_sourceRefId']         = this.record._sourceRefId;
    mineItem['name']                 = this.record.name;
    mineItem['permitNumbers']        = this.record.permitNumbers;
    mineItem['status']               = this.record.status;
    mineItem['type']                 = this.myForm.controls.type.value;
    mineItem['commodities']          = this.record.commodities;
    mineItem['tailingsImpoundments'] = this.record.tailingsImpoundments;
    mineItem['region']               = this.record.region;
    mineItem['location']             = this.record.location;
    mineItem['permittee']            = this.record.permitee;
    mineItem['summary']              = this.myForm.controls.summary.value;
    mineItem['description']          = this.myForm.controls.description.value;
    mineItem['links']                = this.myForm.controls.links.value.split(',');

    this.loadingScreenService.setLoadingState(false, 'main');

    if (!this.isEditing) {
      // Add the mine item.
      // Are we manually adding mines or is this import only?
      this.router.navigate(['mines', this.record._id, 'detail']);
    } else {
      // Update the mine item.
      this.factoryService.editMine(mineItem).subscribe(async res => {
        this.router.navigate(['mines', this.record._id, 'detail']);
      });
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
