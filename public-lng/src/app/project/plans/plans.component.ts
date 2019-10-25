import { Component, OnInit } from '@angular/core';
import { PageTypes } from 'app/utils/page-types.enum';
import { DataService } from 'app/services/data.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss']
})
export class PlansComponent implements OnInit {
  public pageType: PageTypes = PageTypes.PLANS;

  public id: number;
  public text: string[];

  constructor(private dataService: DataService, private route: ActivatedRoute) {
    this.route.parent.params.subscribe(params => {
      this.id = params.id;
      this.text = this.dataService.getText(this.id, this.pageType);
    });
  }

  ngOnInit() {}
}
