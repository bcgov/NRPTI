import { Component, ChangeDetectorRef, EventEmitter, Output, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss']
})
export class DocumentEditComponent implements OnInit {
  @Input() documents = [];
  @Output() documentsToDelete = new EventEmitter();

  private docIdsToDelete = [];

  constructor(private _changeDetectionRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.documents.map(doc => {
      doc['toDelete'] = false;
      return doc;
    });
    this._changeDetectionRef.detectChanges();
  }

  public toggleDeleteDoc(document) {
    document.toDelete = !document.toDelete;
    if (document.toDelete) {
      this.docIdsToDelete.push(document._id);
    } else {
      this.docIdsToDelete = this.docIdsToDelete.filter(x => x !== document._id);
    }
    this.documentsToDelete.emit(this.docIdsToDelete);
  }
}
