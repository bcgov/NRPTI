import { Component, OnInit } from '@angular/core';
import { PageTypes } from '../../utils/page-types.enum';
import { DataService } from '../../services/data.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
export class BackgroundComponent implements OnInit {
  public pageType: PageTypes = PageTypes.BACKGROUND;

  public id: string;
  public text: string[];

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute
  ) {
    this.route.parent.params.subscribe(params => {
      this.id = params.id;
      this.text = this.dataService.getText(this.id, this.pageType);
    });
  }

  ngOnInit() {}
}
