import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingScreenService } from 'nrpti-angular-components';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Mine, Link } from '../../../../../common/src/app/models/bcmi/mine';
import { FactoryService } from '../../services/factory.service';
import { Picklists } from '../../../../../common/src/app/utils/record-constants';
import { UrlValidator } from '../../../../../common/src/app/form-validators/validators';
import moment from 'moment';

@Component({
  selector: 'app-mines-add-edit',
  templateUrl: './mines-add-edit.component.html',
  styleUrls: ['./mines-add-edit.component.scss']
})
export class MinesAddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public mine: Mine;
  public myForm: FormGroup;
  public lastEditedSubText = null;
  public canPublish = false;

  public mineTypes = Picklists.mineTypes;

  public tinyMceSettings = {
    base_url: '/tinymce',
    suffix: '.min',
    browser_spellcheck: true,
    height: 240,
    plugins: ['lists, advlist, link'],
    toolbar: [
      'undo redo | formatselect | ' +
        ' bold italic backcolor | alignleft aligncenter ' +
        ' alignright alignjustify | bullist numlist outdent indent |' +
        ' removeformat | help'
    ]
  };

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private factoryService: FactoryService,
    private loadingScreenService: LoadingScreenService,
    private _changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadingScreenService.setLoadingState(true, 'main');

    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (res && res.mine && res.mine[0] && res.mine[0].data) {
        this.mine = new Mine(res.mine[0].data);
      } else {
        alert('Error: could not load edit mine.');
        this.router.navigate(['mines']);
      }

      this.buildForm();

      this.populateTextFields();

      this.subscribeToFormChanges();

      this.canPublish = this.checkCanPublish();
      this.togglePublishControl();

      this.loading = false;
      this.loadingScreenService.setLoadingState(false, 'main');

      this._changeDetectionRef.detectChanges();
    });
  }

  /**
   * Derive static text strings.
   *
   * @memberof MinesAddEditComponent
   */
  populateTextFields() {
    if (!this.mine) {
      return;
    }

    if (this.mine.dateUpdated) {
      this.lastEditedSubText = `Last Edited on ${moment(this.mine.dateUpdated).format('MMMM DD, YYYY')}`;
    } else if (this.mine.dateAdded) {
      this.lastEditedSubText = `Added on ${moment(this.mine.dateAdded).format('MMMM DD, YYYY')}`;
    }
  }

  /**
   * Build the formcontrols.
   *
   * @memberof MinesAddEditComponent
   */
  buildForm() {
    this.myForm = new FormGroup({
      description: new FormControl((this.mine && this.mine.description) || ''),
      summary: new FormControl((this.mine && this.mine.summary) || ''),
      type: new FormControl((this.mine && this.mine.type) || ''),
      links: new FormArray(this.getLinksFormGroups()),
      publish: new FormControl((this.mine && this.mine.read.includes('public')) || false),
      showPermitNumber: new FormControl(this.mine && this.mine.showPermitNumber)
    });
  }

  /**
   * Subscribe to form changes.
   *
   * @memberof MinesAddEditComponent
   */
  subscribeToFormChanges() {
    this.myForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.canPublish = this.checkCanPublish();
      this.togglePublishControl();

      this._changeDetectionRef.detectChanges();
    });
  }

  /**
   * Builds an array of links FormGroups, each with its own set of FormControls.
   *
   * @returns {FormGroup[]} array of links FormGroup elements
   * @memberof MinesAddEditComponent
   */
  getLinksFormGroups(): FormGroup[] {
    if (!this.mine || !this.mine.links || !this.mine.links.length) {
      return [];
    }

    const links: FormGroup[] = [];

    this.mine.links.forEach((link: Link) => {
      links.push(
        new FormGroup({
          title: new FormControl(link.title || ''),
          url: new FormControl(link.url || '', UrlValidator)
        })
      );
    });

    return links;
  }

  /**
   * Parses an array of links FormGroups into objects expected by the API.
   *
   * @returns {Link[]} array of Links
   * @memberof MinesAddEditComponent
   */
  parseLinksFormGroups(): Link[] {
    const linksFormArray = this.myForm.get('links');

    if (!linksFormArray || !linksFormArray.value || !linksFormArray.value.length) {
      return [];
    }

    const links: Link[] = [];

    linksFormArray.value.forEach(linkFormGroup => {
      // don't include empty links
      if (linkFormGroup.title || linkFormGroup.url) {
        links.push(
          new Link({
            title: linkFormGroup.title,
            url: linkFormGroup.url
          })
        );
      }
    });

    return links;
  }

  /**
   * Tracks type select formcontrol changes.
   *
   * @param {*} optionA
   * @param {*} optionB
   * @returns {boolean}
   * @memberof MinesAddEditComponent
   */
  compareTypeSelection(optionA: any, optionB: any): boolean {
    return optionA === optionB;
  }

  cancel() {
    const shouldCancel = confirm(
      'Leaving this page will discard unsaved changes. Are you sure you would like to continue?'
    );
    if (shouldCancel) {
      this.router.navigate(['mines', this.mine._id, 'detail']);
    }
  }

  /**
   * Toggle the publish formcontrol.
   *
   * @param {*} event
   * @memberof MinesAddEditComponent
   */
  togglePublish(event) {
    if (!event.checked) {
      // always allow unpublishing
      this.myForm.controls.publish.setValue(event.checked);
    } else if (this.canPublish) {
      // conditionally allow publishing
      this.myForm.controls.publish.setValue(event.checked);
    }

    this._changeDetectionRef.detectChanges();
  }

  /**
   * Return true if the record meets the criteria to be published, false otherwise.
   *
   * @returns {boolean}
   * @memberof MinesAddEditComponent
   */
  checkCanPublish(): boolean {
    return (
      this.mine &&
      this.myForm &&
      this.myForm.get('description').value &&
      this.myForm.get('summary').value &&
      this.myForm.get('type').value &&
      this.mine.name &&
      this.mine.status &&
      this.mine.permitNumber &&
      this.mine.commodities &&
      this.mine.commodities.length &&
      this.mine.permittee &&
      this.mine.location &&
      this.mine.location['coordinates'] &&
      this.mine.location['coordinates'].length
    );
  }

  /**
   * Enable or disable the publish control based on this.canPublish.
   *
   * @memberof MinesAddEditComponent
   */
  togglePublishControl() {
    if (this.canPublish) {
      this.myForm.get('publish').enable({ emitEvent: false });
    } else {
      this.myForm.get('publish').setValue(false, { emitEvent: false });
      this.myForm.get('publish').disable({ emitEvent: false });
    }
  }

  /**
   * Return true if there are errors in the form data, false otherwise.
   *
   * @returns {boolean}
   * @memberof MinesAddEditComponent
   */
  isFormValid(): boolean {
    if (this.myForm && this.myForm.get('links').dirty && this.myForm.get('links').invalid) {
      return false;
    }

    return true;
  }

  /**
   * Parses the form data into a mine object.
   *
   * @returns mine object
   * @memberof MinesAddEditComponent
   */
  buildMineObject() {
    const mineItem = {};

    mineItem['_id'] = this.mine._id;

    this.myForm.get('type').dirty && (mineItem['type'] = this.myForm.get('type').value);
    this.myForm.get('description').dirty && (mineItem['description'] = this.myForm.get('description').value);
    this.myForm.get('summary').dirty && (mineItem['summary'] = this.myForm.get('summary').value);
    this.myForm.get('links').dirty && (mineItem['links'] = this.parseLinksFormGroups());
    this.myForm.get('showPermitNumber').dirty &&
      (mineItem['showPermitNumber'] = this.myForm.get('showPermitNumber').value);

    if (this.myForm.get('publish').dirty && this.myForm.get('publish').value && this.canPublish) {
      mineItem['addRole'] = 'public';
    } else if ((this.myForm.get('publish').dirty && !this.myForm.get('publish').value) || !this.canPublish) {
      mineItem['removeRole'] = 'public';
    }

    return mineItem;
  }

  /**
   * Transform the form data and save.
   *
   * @memberof MinesAddEditComponent
   */
  async submit() {
    this.loadingScreenService.setLoadingState(true, 'main');

    const mineItem = this.buildMineObject();

    await this.factoryService.editMine(mineItem);
    this.loadingScreenService.setLoadingState(false, 'main');
    this.router.navigate(['mines', this.mine._id, 'detail']);
  }

  ngOnDestroy(): void {
    this.loadingScreenService.setLoadingState(false, 'main');

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
