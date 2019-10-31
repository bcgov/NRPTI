import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  public id: string;
  public project: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.project = (proj => {
        switch (proj) {
          case '1':
            return 'LNG Canada';
          case '2':
            return 'Coastal GasLink';
          default:
            return null;
        }
      })(this.id);
    });
  }
}
