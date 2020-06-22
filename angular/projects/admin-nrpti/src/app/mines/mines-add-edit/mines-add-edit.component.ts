import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingScreenService, Utils } from 'nrpti-angular-components';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Mine, Link } from '../../../../../common/src/app/models/bcmi/mine';
import { FactoryService } from '../../services/factory.service';
import { Picklists } from '../../../../../common/src/app/utils/record-constants';

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

  public mineTypes = Picklists.mineTypes;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private factoryService: FactoryService,
    private loadingScreenService: LoadingScreenService,
    private utils: Utils,
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
    if (this.mine.dateUpdated) {
      this.lastEditedSubText = `Last Edited on ${this.utils.convertJSDateToString(new Date(this.mine.dateUpdated))}`;
    } else {
      this.lastEditedSubText = `Added on ${this.utils.convertJSDateToString(new Date(this.mine.dateAdded))}`;
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
      publish: new FormControl((this.mine && this.mine.read.includes('public')) || false)
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
          url: new FormControl(link.url || '')
        })
      );
    });

    return links;
  }

  /**
   * Parses an array of links FormGroups into objects expected by the API.
   *
   * @returns {object[]} array of links objects
   * @memberof MinesAddEditComponent
   */
  parseLinksFormGroups(): object[] {
    const linksFormArray = this.myForm.get('links');

    if (!linksFormArray || !linksFormArray.value || !linksFormArray.value.length) {
      return [];
    }

    const links: object[] = [];

    linksFormArray.value.forEach(linkFormGroup => {
      links.push({
        title: linkFormGroup.title,
        url: linkFormGroup.url
      });
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
    this.myForm.controls.publish.setValue(event.checked);

    this._changeDetectionRef.detectChanges();
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

    if (this.myForm.get('publish').dirty && this.myForm.get('publish').value) {
      mineItem['addRole'] = 'public';
    } else if (this.myForm.get('publish').dirty && !this.myForm.get('publish').value) {
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

    this.factoryService.editMine(mineItem).subscribe(async res => {
      this.loadingScreenService.setLoadingState(false, 'main');

      this.router.navigate(['mines', this.mine._id, 'detail']);
    });
  }

  ngOnDestroy(): void {
    this.loadingScreenService.setLoadingState(false, 'main');

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
