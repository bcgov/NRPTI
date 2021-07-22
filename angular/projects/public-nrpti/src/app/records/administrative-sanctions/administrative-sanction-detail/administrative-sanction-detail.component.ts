import { Component, OnInit, ChangeDetectorRef, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { AdministrativeSanctionNRCED, Document } from '../../../../../../common/src/app/models';
import { FactoryService } from '../../../services/factory.service';
import { Utils as CommonUtils } from '../../../../../../common/src/app/utils/utils';
import { Utils as GlobalUtils } from 'nrpti-angular-components';

@Component({
  selector: 'app-administrative-sanction-detail',
  templateUrl: './administrative-sanction-detail.component.html',
  styleUrls: ['./administrative-sanction-detail.component.scss']
})
export class AdministrativeSanctionDetailComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: any;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public loading = true;
  public activeTab = 'detail';

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public factoryService: FactoryService,
    public _changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.data) {
      return;
    }

    this.updateComponent();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.firstChange) {
      return;
    }

    if (changes && changes.data && changes.data.currentValue) {
      this.updateComponent();
    }
  }

  updateComponent() {
    this.data = new AdministrativeSanctionNRCED(this.data);

    // populate documents
    this.getDocuments();

    this.loading = false;
    this._changeDetectionRef.detectChanges();
  }

  getDocuments() {
    if (
      !this.data ||
      !this.data.documents ||
      !this.data.documents.length ||
      CommonUtils.isObject(this.data.documents[0])
    ) {
      return;
    }

    this.factoryService
      .getDocuments(this.data.documents)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res: any) => {
        if (!res || !res.length) {
          return;
        }

        const documents = (res[0] && res[0].data && res[0].data.searchResults) || [];

        this.data.documents = documents.map(document => {
          return new Document(document);
        });
      });
  }

  activateTab(tabLabel: string): void {
    this.activeTab = tabLabel;
  }

  isTabActive(tabLabel: string): boolean {
    return this.activeTab === tabLabel;
  }

  displayName(agency) {
    return GlobalUtils.displayNameFull(agency);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  convertAcronyms(acronym) {
    return GlobalUtils.convertAcronyms(acronym);
  }
}
