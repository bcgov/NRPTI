import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-record-detail',
  templateUrl: './record-detail.component.html',
  styleUrls: ['./record-detail.component.scss']
})
export class RecordDetailComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    console.log('RECORD DETAILS');
  }
}
