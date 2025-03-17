import { Component, OnInit } from '@angular/core';
import { PageTypes } from '../../utils/page-types.enum';
import { DataService } from '../../services/data.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-nations',
  templateUrl: './nations.component.html',
  styleUrls: ['./nations.component.scss']
})
export class NationsComponent implements OnInit {
  public pageType: PageTypes = PageTypes.NATIONS;

  public id: string;
  public text: string[];

  constructor(private dataService: DataService, private route: ActivatedRoute) {
    this.route.parent.params.subscribe(params => {
      this.id = params.id;

      this.text = this.dataService.getText(this.id, this.pageType);
    });
  }

  ngOnInit() {}
}
