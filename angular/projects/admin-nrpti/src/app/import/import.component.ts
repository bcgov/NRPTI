import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FactoryService } from '../services/factory.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  public dateStart: object = {};

  constructor(public factoryService: FactoryService) {}

  ngOnInit() {}

  startJob() {
    console.log('start job');
    this.postToApi().subscribe();
  }

  postToApi(): Observable<any> {
    return this.factoryService.startTask({ dataSource: 'epic' });
  }
}
