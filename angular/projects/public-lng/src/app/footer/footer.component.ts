import { Component } from '@angular/core';
import { ApiService } from '../services/api';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  constructor(public api: ApiService, public router: Router) {}
}
