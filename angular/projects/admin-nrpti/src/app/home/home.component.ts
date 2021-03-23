import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingScreenService } from 'nrpti-angular-components';
import { KeycloakService } from '../services/keycloak.service';
import { Chart } from 'chart.js';
import { MetricService } from '../services/metric.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('chart1') chart1;
  data365Chart;
  @ViewChild('chart2') chart2;
  dataRecordType;
  public loading = true;

  constructor(
    public route: ActivatedRoute,
    public keycloakService: KeycloakService,
    private metricService: MetricService,
    private router: Router,
    private loadingScreenService: LoadingScreenService
  ) { }

  async ngOnInit() {
    const issuingAgencyPublished365 = await this.metricService.getMetric('IssuingAgencyPublished365');
    // tslint:disable-next-line: prefer-const
    let labels365 = [];
    // tslint:disable-next-line: prefer-const
    let data365 = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < issuingAgencyPublished365.length; i++) {
      const keyName = this.getKeyName(issuingAgencyPublished365[i]);
      labels365.push(issuingAgencyPublished365[i][keyName]);
      data365.push(issuingAgencyPublished365[i]['count']);
    }
    this.data365Chart = new Chart(this.chart1.nativeElement, {
      type: 'pie',
      data: {
        labels: labels365,
        datasets: [{
          data: data365,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(100, 33, 155, 0.2)',
            'rgba(100, 33, 77, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(100, 33, 155, 1)',
            'rgba(100, 33, 77, 0.2)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        cutoutPercentage: 50
      }
    });

    // RecordByType
    const recordTypes = await this.metricService.getMetric('RecordByType');
    // tslint:disable-next-line: prefer-const
    let typeLabels = [];
    // tslint:disable-next-line: prefer-const
    let typeData = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < recordTypes.length; i++) {
      const keyName = this.getKeyName(recordTypes[i]);
      typeLabels.push(recordTypes[i][keyName]);
      typeData.push(recordTypes[i]['count']);
    }
    this.dataRecordType = new Chart(this.chart2.nativeElement, {
      type: 'pie',
      data: {
        labels: typeLabels,
        datasets: [{
          data: typeData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(100, 33, 155, 0.2)',
            'rgba(100, 33, 77, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(100, 33, 155, 1)',
            'rgba(100, 33, 77, 0.2)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        cutoutPercentage: 50
      }
    });
  }

  getKeyName(metricObject) {
    // Determine the non-count key by popping the first one off, checking
    // if it's `count` and if it is, pop the next one as there are only
    // ever 2 attributes in the metric report.  This is how metabase creates
    // it's queries.
    const theKeys = Object.keys(metricObject);
    let keyName = theKeys.pop();

    if (keyName === 'count') {
      keyName = theKeys.pop();
    }
    return keyName;
  }

  activateLoading(path) {
    this.loadingScreenService.setLoadingState(true, 'body');
    this.router.navigate(path);
  }
}
