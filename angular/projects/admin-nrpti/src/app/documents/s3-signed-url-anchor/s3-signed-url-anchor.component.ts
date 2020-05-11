import {
  Component,
  Input,
  ChangeDetectorRef,
  OnDestroy,
  ElementRef,
  ViewChild,
  SimpleChanges,
  OnInit,
  OnChanges
} from '@angular/core';
import { Subject } from 'rxjs';
import { FactoryService } from '../../services/factory.service';
import { Document } from '../../../../../common/src/app/models';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-s3-signed-url-anchor',
  templateUrl: './s3-signed-url-anchor.component.html',
  styleUrls: ['./s3-signed-url-anchor.component.scss']
})
export class S3SignedUrlAnchorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() document: Document = null;

  @ViewChild('signedUrlAnchor') anchor: ElementRef<HTMLElement>;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  private fetchInProgress = false;
  private clickInProgress = false;

  public isS3Document = false;

  constructor(public factoryService: FactoryService, public _changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.isS3Document = !!this.document.key;

    this._changeDetectionRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.firstChange) {
      return;
    }

    if (changes && changes.document && changes.document.currentValue) {
      this.document = changes.document.currentValue;

      this.isS3Document = !!this.document.key;

      this._changeDetectionRef.detectChanges();
    }
  }

  getS3SignedUrl() {
    // ignore repeated clicks if fetch in progress
    if (!this.fetchInProgress) {
      // anchor manually clicked
      this.fetchInProgress = true;

      event.preventDefault();
      event.stopPropagation();

      this.factoryService
        .getS3SignedUrl(this.document._id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(signedUrl => {
          this.clickInProgress = true;

          // update the href and auto re-click
          this.anchor.nativeElement.setAttribute('href', signedUrl);
          this.anchor.nativeElement.click();
        });
    }

    if (this.clickInProgress) {
      // anchor was auto clicked
      this.fetchInProgress = false;
      this.clickInProgress = false;
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
