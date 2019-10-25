import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { Document } from 'app/models/document';

@Injectable()
export class DocumentService {
  private document: Document = null;

  constructor(private api: ApiService) {}

  // get all documents for the specified application id
  getAllByApplicationId(appId: string): Observable<Document[]> {
    return this.api.getDocumentsByAppId(appId).pipe(
      map((res: Document[]) => {
        if (!res || res.length === 0) {
          return [] as Document[];
        }

        const documents: Document[] = [];
        res.forEach(document => {
          documents.push(new Document(document));
        });
        return documents;
      }),
      catchError(this.api.handleError)
    );
  }

  // get a specific document by its id
  getById(documentId: string, forceReload: boolean = false): Observable<Document> {
    if (this.document && this.document._id === documentId && !forceReload) {
      return of(this.document);
    }

    return this.api.getDocument(documentId).pipe(
      map((res: Document[]) => {
        if (!res || res.length === 0) {
          return null as Document;
        }

        // return the first (only) document
        this.document = new Document(res[0]);
        return this.document;
      }),
      catchError(this.api.handleError)
    );
  }

  add(formData: FormData): Observable<Document> {
    return this.api.uploadDocument(formData).pipe(
      map((res: Document) => {
        if (!res) {
          return null as Document;
        }

        return new Document(res);
      }),
      catchError(this.api.handleError)
    );
  }
}
