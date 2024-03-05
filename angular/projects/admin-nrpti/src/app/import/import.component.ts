import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FactoryService } from '../services/factory.service';
import {
  TableObject,
  TableTemplateUtils,
  IColumnObject,
  IPageSizePickerOption,
  ITableMessage,
  ConfigService
} from 'nrpti-angular-components';
import { ImportTableRowsComponent } from '../import/import-rows/import-table-rows.component';
import { takeWhile } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ImportService } from '../services/import.service';
import { SearchResult } from 'nrpti-angular-components';
import { interval } from 'rxjs';
import { Constants } from '../utils/constants/misc';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit, OnDestroy {
  private alive = true;

  public loading = true;
  public showSourceSystem = true;
  public showSourceSystemEPIC = true;
  public showSourceSystemNRIS = true;
  public showSourceSystemEMLI = true;
  public showSourceSystemCORE = true;
  public showSourceSystemBCOGC = true;
  public buttonActions = { epic: false, 'nris-epd': false, 'nris-emli': false, core: false, bcogc: false };
  public tableData: TableObject = new TableObject({ component: ImportTableRowsComponent });
  public tableColumns: IColumnObject[] = [
    {
      name: 'Start',
      value: 'startDate',
      width: 'col-3'
    },
    {
      name: 'Finish',
      value: 'finishDate',
      width: 'col-3'
    },
    {
      name: 'Status',
      value: 'status',
      width: 'col-2'
    },
    {
      name: 'Source',
      value: 'dataSourceLabel',
      width: 'col-2'
    },
    {
      name: 'Items',
      value: 'itemTotal',
      width: 'col-2'
    }
  ];
  constructor(
    private route: ActivatedRoute,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef,
    private factoryService: FactoryService,
    private importService: ImportService,
    private toastService: ToastService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    const self = this;

    this.route.params.pipe(takeWhile(() => this.alive)).subscribe(params => {
      // Get params from route, shove into the tableTemplateUtils so that we get a new dataset to work with.
      this.tableData = this.tableTemplateUtils.updateTableObjectWithUrlParams(params, this.tableData);

      // Make api call with tableData params.

      this._changeDetectionRef.detectChanges();
    });

    this.importService
      .getValue()
      .pipe(takeWhile(() => this.alive))
      .subscribe((searchResult: SearchResult) => {
        const records = searchResult.data;
        self.tableData.items = records.map(record => {
          return { rowData: record };
        });

        self.tableData.totalListItems = searchResult.totalSearchCount;
        self.tableData.columns = self.tableColumns;
        self.loading = false;
        self._changeDetectionRef.detectChanges();
      });

    interval(this.configService.config['IMPORT_TABLE_INTERVAL'])
      .pipe(takeWhile(() => this.alive))
      .subscribe(() => {
        self.importService.refreshData();
      });

    // Feature flagging
    this.buttonActions['nris-emli'] = this.configService.config['FEATURE_FLAG']['nris-emli-importer'];

    this.disableSourceSystem();
  }

  private disableSourceSystem() {
    if (
      this.factoryService.userOnlyInLimitedRole(Constants.ApplicationRoles.ADMIN_FLNRO) ||
      this.factoryService.userOnlyInLimitedRole(Constants.ApplicationRoles.ADMIN_FLNR_NRO) ||
      this.factoryService.userOnlyInLimitedRole(Constants.ApplicationRoles.ADMIN_AGRI) ||
      this.factoryService.userOnlyInLimitedRole(Constants.ApplicationRoles.ADMIN_ALC) ||
      this.factoryService.userOnlyInLimitedRole(Constants.ApplicationRoles.ADMIN_ENV_COS)
    ) {
      this.showSourceSystem = false;
    }
  }

  onMessageOut(msg: ITableMessage) {
    switch (msg.label) {
      case 'rowClicked':
        break;
      case 'rowSelected':
        break;
      case 'columnSort':
        this.setColumnSort(msg.data);
        break;
      case 'pageNum':
        this.onPageNumUpdate(msg.data);
        break;
      case 'pageSize':
        this.onPageSizeUpdate(msg.data);
        break;
      default:
        break;
    }
  }

  setColumnSort(column) {
    if (this.tableData.sortBy.charAt(0) === '+') {
      this.tableData.sortBy = '-' + column;
    } else {
      this.tableData.sortBy = '+' + column;
    }
    this.submit();
  }

  onPageNumUpdate(pageNumber) {
    this.tableData.currentPage = pageNumber;
    this.submit();
  }

  onPageSizeUpdate(pageSize: IPageSizePickerOption) {
    this.tableData.pageSize = pageSize.value;
    this.submit();
  }

  submit() {
    this.tableTemplateUtils.navigateUsingParams(this.tableData, ['imports']);
  }

  async startJob(dataSourceType: string) {
    await this.factoryService
      .startTask({
        dataSourceType: dataSourceType,
        taskType: 'import'
      })
      .toPromise();

    this.buttonActions[dataSourceType] = true;
    setTimeout(() => {
      this.buttonActions[dataSourceType] = false;
    }, 5000);
    // Send this notification to the toast service
    this.toastService.addMessage(dataSourceType, 'Job Started', Constants.ToastTypes.SUCCESS);
  }

  async getAllActsAndRegulations() {
    console.log('getParentAct>>>>>>called');
    let actsRegulationsMap = await this.factoryService
      .getAllActsAndRegulations();

    // Send this notification to the toast service

    this.toastService.addMessage('Act actsRegulationsMap ' + actsRegulationsMap
    , JSON.stringify(actsRegulationsMap)
    , Constants.ToastTypes.SUCCESS);
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
