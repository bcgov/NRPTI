import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivityTypes } from '../../../../../global/src/lib/utils/activity-types.enum';
import { Utils } from 'nrpti-angular-components';
import { LoadingScreenService } from 'nrpti-angular-components';
import { News } from '../../../../../common/src/app/models/master/common-models/news';
import { FactoryService } from '../../services/factory.service';
import { Constants } from '../../utils/constants/misc';

@Component({
  standalone: false,
  selector: 'app-news-add-edit',
  templateUrl: './news-add-edit.component.html',
  styleUrls: ['./news-add-edit.component.scss']
})
export class NewsAddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public loading = true;
  public isEditing = false;
  public record;
  public myForm: FormGroup;
  public lastEditedSubText = null;
  public activityTypes = Object.keys(ActivityTypes);

  // Flavour data
  public nrcedFlavour = null;
  public lngFlavour = null;
  public lngPublishSubtext = 'Not published';
  public nrcedPublishSubtext = 'Not published';

  public datepickerMinDate = Constants.DatepickerMinDate;

  // Pick lists
  public projects = [
    {
      id: '588511d0aaecd9001b826192',
      name: 'LNG Canada'
    },
    {
      id: '588511c4aaecd9001b825604',
      name: 'Coastal Gaslink'
    }
  ];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private factoryService: FactoryService,
    private loadingScreenService: LoadingScreenService,
    private utils: Utils,
    private _changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.isEditing = res.breadcrumb !== 'Add News';
      if (this.isEditing) {
        if (res && res.record && res.record[0] && res.record[0].data) {
          this.record = new News(res.record[0].data);
        } else {
          alert('Error: could not load edit news.');
          this.router.navigate(['/']);
        }
      } else {
        // Add
        if (res && res.record) {
          this.record = new News(res.record);
        }
      }
      this.buildForm();
      this.loading = false;
      this._changeDetectionRef.detectChanges();
    });
  }

  private buildForm() {
    // Default today's date
    if (this.record.date === null) {
      this.record.date = new Date();
    }
    this.myForm = new FormGroup({
      description: new FormControl((this.record && this.record.description) || ''),
      _epicProjectId: new FormControl({
        id: this.record._epicProjectId,
        name: this.record.projectName
      }),
      type: new FormControl(this.record.type),
      title: new FormControl(this.record.title),
      url: new FormControl((this.record && this.record.url) || ''),
      date: new FormControl(
        (this.record && this.record.date && this.utils.convertJSDateToNGBDate(new Date(this.record.date))) || ''
      )
    });
  }

  compareTypeSelection(optionA: any, optionB: any): boolean {
    return optionA === optionB;
  }

  // Needed in order to determine which complex object is selected
  compareProjectSelection(optionA: any, optionB: any): boolean {
    return optionA && optionB ? optionA.id === optionB.id : optionA === optionB;
  }

  navigateBack() {
    if (this.isEditing) {
      this.router.navigate(['news', this.record.system, this.record._id, 'detail']);
    } else {
      this.router.navigate(['news']);
    }
  }

  async submit() {
    this.loadingScreenService.setLoadingState(true, 'main');
    const newsItem = {};
    newsItem['description'] = this.myForm.controls.description.value;
    newsItem['_epicProjectId'] = this.myForm.controls._epicProjectId.value.id;
    newsItem['projectName'] = this.myForm.controls._epicProjectId.value.name;
    newsItem['type'] = this.myForm.controls.type.value;
    newsItem['title'] = this.myForm.controls.title.value;
    newsItem['url'] = this.myForm.controls.url.value;
    newsItem['date'] =
      this.myForm.controls.date.value && this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('date').value);
    newsItem['_id'] = this.record._id;
    newsItem['_schemaName'] = this.record._schemaName;

    this.loadingScreenService.setLoadingState(false, 'main');

    if (!this.isEditing) {
      // Add the news item.
      const res = await this.factoryService.createNews(newsItem);
      if (!res || !res._id) {
        alert('Failed to create News Item.');
      } else {
        this.router.navigate(['news', this.record.system, res._id, 'detail']);
      }
    } else {
      // Update the news item.
      const res = await this.factoryService.editNews(newsItem);
      if (!res || !res._id) {
        alert('Failed to create News Item.');
      } else {
        this.router.navigate(['news', this.record.system, this.record._id, 'detail']);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
