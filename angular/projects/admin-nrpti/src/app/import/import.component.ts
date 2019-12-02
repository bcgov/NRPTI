import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  public dateStart: object = {};

  constructor() {}

  ngOnInit() {}

  startJob() {
    console.log('start job');
    // TODO
  }
}
