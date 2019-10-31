import { Component, OnInit } from '@angular/core';
import { PageTypes } from 'app/utils/page-types.enum';
import { DataService } from 'app/services/data.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  public pageType: PageTypes = PageTypes.OVERVIEW;

  public id: number;
  public text: string[];
  public details: object;
  public images: object;
  public activities: object[];

  constructor(private dataService: DataService, private route: ActivatedRoute) {
    this.route.parent.params.subscribe(params => {
      this.id = params.id;

      this.text = this.dataService.getText(this.id, this.pageType);
      this.details = this.dataService.getDetails(this.id, this.pageType);
      this.images = this.dataService.getImages(this.id, this.pageType);
      this.activities = this.dataService.getActivities(this.id, this.pageType);
    });
  }

  ngOnInit() {}
}
