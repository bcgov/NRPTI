import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  public id: string;
  public project: string;

  constructor(
    private route: ActivatedRoute,
    public router: Router
    ) {}

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

  navToAuthorizations() {
    this.router.navigate(['/project', this.id, 'authorizations', { sortBy: '-_master.dateIssued'}]);
  }

  navToCompliance() {
    this.router.navigate(['/project', this.id, 'compliance', { sortBy: '-_master.dateIssued'}]);
  }

  navToPlans() {
    this.router.navigate(['/project', this.id, 'plans', { sortBy: '-_master.dateIssued'}]);
  }

  navToIndigenousNations() {
    this.router.navigate(['/project', this.id, 'nations', { sortBy: '-_master.date'}]);
  }

}
