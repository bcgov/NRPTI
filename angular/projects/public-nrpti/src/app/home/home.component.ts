import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  constructor(public route: ActivatedRoute) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.route.params.subscribe(params => {
      // scroll to the div specified in the 'div' param
      if (params && params.div) {
        this.scrollTo(params.div);
      }
    });
  }

  scrollTo(div) {
    const element = document.querySelector('#' + div);
    if (element) {
      element.scrollIntoView();
    }
  }
}
