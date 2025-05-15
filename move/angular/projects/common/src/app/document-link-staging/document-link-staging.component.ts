import { Component, ChangeDetectorRef, EventEmitter, Output, Input } from '@angular/core';
import { Document } from '../models/document';

@Component({
  standalone: false,
  selector: 'app-document-link-staging',
  templateUrl: './document-link-staging.component.html',
  styleUrls: ['./document-link-staging.component.scss']
})
export class DocumentLinkStagingComponent {
  public isCollapsed = true;
  public recordFiles: File[] = [];
  public documents: Document[] = [];
  public links: Document[] = [];
  public linkFileName = '';
  public linkUrl = '';
  public maxFilesReached = false;

  @Input() maxFiles = 5;
  @Output() linksChanged = new EventEmitter();
  @Input() disableAdd = false;
  @Output() documentsChanged = new EventEmitter();

  @Input() params = {
    maxFiles: 5,
    maxSize: 400,
    showInfo: false,
    showList: false,
    hideWhenMaxFilesReached: false
  };

  constructor(private _changeDetectionRef: ChangeDetectorRef) {}

  public addDocuments(files) {
    if (files) {
      // safety check
      this.documents = [];
      for (const file of files) {
        if (file) {
          const document = new Document();
          document.upfile = file;
          document.fileName = file.name;

          // save document for upload to db when project is added or saved
          this.documents.push(document);
        }
      }
      this.checkIfMaxFilesReached();
      this.documentsChanged.emit(this.documents);
    }
    this._changeDetectionRef.detectChanges();
  }

  public addLink() {
    if (this.linkUrl && this.linkFileName) {
      if (this.links.find(x => x.url === this.linkUrl)) {
        return;
      }
      const link = new Document();
      try {
        link.url = new URL(this.linkUrl).href;
      } catch (e) {
        alert('You must submit a valid url. Be sure to include http:// or https:// as part of your URL.');
        this.linkUrl = '';
        return;
      }
      link.fileName = this.linkFileName;

      // save link for upload to db when project is added or saved
      this.links.push(link);
      this.checkIfMaxFilesReached();
      this.linksChanged.emit(this.links);
      this.linkFileName = '';
      this.linkUrl = '';
    }
    this._changeDetectionRef.detectChanges();
  }

  public deleteDocument(doc: Document) {
    if (doc && this.documents) {
      // safety check
      // remove doc from current list
      this.recordFiles = this.recordFiles.filter(item => item.name !== doc.fileName);
      this.documents = this.documents.filter(item => item.fileName !== doc.fileName);
      this.checkIfMaxFilesReached();
      this.documentsChanged.emit(this.documents);
    }
  }

  public deleteLink(link: Document) {
    if (link && this.links) {
      // safety check
      // remove doc from current list
      this.links = this.links.filter(item => item.fileName !== link.fileName);
      this.checkIfMaxFilesReached();
      this.linksChanged.emit(this.links);
    }
  }

  private checkIfMaxFilesReached() {
    this.maxFilesReached =
      this.params.hideWhenMaxFilesReached && this.documents.length + this.links.length === Number(this.params.maxFiles);
  }
}
