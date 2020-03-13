import { Component, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { Document } from '../models/document';

@Component({
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

  @Output() linksChanged = new EventEmitter();
  @Output() documentsChanged = new EventEmitter();

  constructor(private _changeDetectionRef: ChangeDetectorRef) {}

  public addDocuments(files) {
    if (files) {
      // safety check
      for (const file of files) {
        if (file) {
          // ensure file is not already in the list

          if (this.documents.find(x => x.fileName === file.name)) {
            // this.snackBarRef = this.snackBar.open('Can\'t add duplicate file', null, { duration: 2000 });
            continue;
          }

          this.recordFiles.push(file);

          const document = new Document();
          document.upfile = file;
          document.fileName = file.name;

          // save document for upload to db when project is added or saved
          this.documents.push(document);
        }
      }
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
      this.documentsChanged.emit(this.documents);
    }
  }

  public deleteLink(link: Document) {
    if (link && this.links) {
      // safety check
      // remove doc from current list
      this.links = this.links.filter(item => item.fileName !== link.fileName);
      this.linksChanged.emit(this.links);
    }
  }
}
