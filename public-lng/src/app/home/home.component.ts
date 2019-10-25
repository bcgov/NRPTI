import { Component, OnInit } from '@angular/core';
import { PageTypes } from 'app/utils/page-types.enum';
import { DataService } from 'app/services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public pageType: PageTypes = PageTypes.HOME;

  public activities: object[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    const homeJson = this.dataService.getHome();
    if (homeJson.activities) {
      this.activities = homeJson.activities;
    }
  }
}
