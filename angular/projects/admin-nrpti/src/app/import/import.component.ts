import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  public dateStart: object = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  startJob() {
    console.log('start job');
    this.postToApi().subscribe();
  }

  postToApi(): Observable<any> {
    return this.http.post<any>('https://nrpti-dev.pathfinder.gov.bc.ca/api/task', { dataSource: 'epic' }, {});
  }
}
