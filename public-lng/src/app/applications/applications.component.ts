import { Component, OnInit, AfterViewInit, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { AppMapComponent } from './app-map/app-map.component';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('appmap') appmap: AppMapComponent;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.addClass(document.body, 'no-scroll');
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'no-scroll');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
