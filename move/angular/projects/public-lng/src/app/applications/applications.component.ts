import { Component, OnInit, AfterViewInit, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { AppMapComponent } from './app-map/app-map.component';

@Component({
  standalone: false,
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('appmap') appmap: AppMapComponent;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  // Temporary to satisfy template
  public isLoading = false;
  public apps = null;
  public isApplicationsMapVisible = false;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.addClass(document.body, 'no-scroll');
  }

  ngAfterViewInit() {}

  public updateCoordinates() {
    // Temporary to satisfy template
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'no-scroll');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
