import { Component } from '@angular/core';
import { ApiService } from 'app/services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  constructor(public api: ApiService, public router: Router) {}
}
