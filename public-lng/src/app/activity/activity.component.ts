import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Activity } from 'app/models/activity';
// import { Router } from '@angular/router';

/**
 * Activity component.
 * Displays a list of activity updates.
 *
 * @export
 * @class ActivityComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit, OnChanges {
  @Input() activitiesJSON: object[];

  public allActivities: Activity[] = [];

  public pagination = {
    currentPage: 0,
    itemsPerPage: 5,
    pageCount: 1
  };

  public activitiesToDisplay: Activity[] = [];

  constructor() {}

  ngOnInit() {
    this.updateActivities();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activitiesJSON) {
      this.updateActivities();
    }
  }

  // public router: Router;

  public updateActivities(): void {
    this.initializeActivities();
    this.setInitialPagination();
    this.updateActivitiesToDisplay();
  }

  public initializeActivities(): void {
    const activities: Activity[] = [];
    Object.keys(this.activitiesJSON).forEach(key => {
      activities.push(new Activity(this.activitiesJSON[key]));
    });

    this.allActivities = activities;
  }

  public updateActivitiesToDisplay(): void {
    const startIndex: number = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
    const endIndex: number = this.pagination.currentPage * this.pagination.itemsPerPage;

    this.activitiesToDisplay = this.allActivities.slice(startIndex, endIndex);
  }

  public setInitialPagination(page: number = 1, itemsPerPage: number = 5): void {
    this.pagination.currentPage = page;
    this.pagination.itemsPerPage = itemsPerPage;
    this.pagination.pageCount = Math.max(1, Math.ceil(this.allActivities.length / this.pagination.itemsPerPage));
  }

  public updatePage(page: number = 0) {
    if (
      (page === -1 && this.pagination.currentPage + page >= 1) ||
      (page === 1 && this.pagination.pageCount >= this.pagination.currentPage + page)
    ) {
      this.pagination.currentPage += page;
      this.updateActivitiesToDisplay();
    }
  }

  public setPage(page: number = 1) {
    if (page >= 1 && this.pagination.pageCount >= page) {
      this.pagination.currentPage = page;
      this.updateActivitiesToDisplay();
    }
  }
}
