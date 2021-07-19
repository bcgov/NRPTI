import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-share-record-button',
  templateUrl: './share-record-button.component.html',
  styleUrls: ['./share-record-button.component.scss']
})
export class ShareRecordButtonComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  @Input() recordId = 'searchbox';
  @Input() buttonText = 'Share Record';

  public disabled = false;

  constructor(public router: Router) {}

  ngOnInit() {}

  shareRecord() {
    const defaultText = this.buttonText;

    this.buttonText = 'Link copied';
    this.disabled = true;

    this.copyToClipboard(this.buildFullUrl());

    setTimeout(() => {
      this.buttonText = defaultText;
      this.disabled = false;
    }, 1000);
  }

  private buildFullUrl() {
    const tree = this.router.parseUrl(this.router.url);

    if (this.recordId === 'searchbox') {
      delete tree.root.children.primary.segments[0].parameters['autofocus'];
    } else {
      tree.root.children.primary.segments[0].parameters['autofocus'] = this.recordId;
    }

    return `${window.location.origin}${this.router.serializeUrl(tree)}`;
  }

  private copyToClipboard(text: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = text;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
