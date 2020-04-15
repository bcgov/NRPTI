import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Document } from '../../../../common/src/app/models/document';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Provides methods for retrieving and working with documents.
 *
 * @export
 * @class DocumentService
 */
@Injectable({ providedIn: 'root' })
export class DocumentService {
  constructor(public apiService: ApiService, public http: HttpClient) {}

  public createDocument(document: FormData, recordId: string): Promise<any> {
    const queryString = `record/${recordId}/document`;
    return this.http.post<any>(`${this.apiService.pathAPI}/${queryString}`, document, {}).toPromise();
  }

  public deleteDocument(docId: string, recordId: string): Promise<any> {
    const queryString = `record/${recordId}/document/${docId}`;
    return this.http.delete<any>(`${this.apiService.pathAPI}/${queryString}`).toPromise();
  }

  public publishDocument(docId: string): Promise<any> {
    if (!document) {
      throw Error('DocumentService - publishDocument - missing required docId param');
    }

    const queryString = `document/${docId}/publish`;
    return this.http.post<any>(`${this.apiService.pathAPI}/${queryString}`, null).toPromise();
  }

  public unpublishDocument(docId: string): Promise<any> {
    if (!document) {
      throw Error('DocumentService - unpublishDocument - missing required docId param');
    }

    const queryString = `document/${docId}/unpublish`;
    return this.http.post<any>(`${this.apiService.pathAPI}/${queryString}`, null).toPromise();
  }

  public getS3SignedUrl(docId: string): Observable<any> {
    if (!document) {
      throw Error('DocumentService - getS3SignedUrl - missing required docId param');
    }

    const queryString = `document/${docId}/signedurl`;
    return this.http.get<any>(`${this.apiService.pathAPI}/${queryString}`);
  }

  private downloadResource(id: string): Promise<Blob> {
    const queryString = `document/${id}/download`;
    return this.http
      .get<Blob>(this.apiService.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' })
      .toPromise();
  }

  public async downloadDocument(document: Document): Promise<void> {
    const blob = await this.downloadResource(document._id);
    const filename = document.fileName;

    if (this.apiService.isMS) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      window.document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
  }

  public async openDocument(document: Document): Promise<void> {
    const blob = await this.downloadResource(document._id);
    const filename = document.fileName;

    if (this.apiService.isMS) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const tab = window.open();
      const fileURL = URL.createObjectURL(blob);
      tab.location.href = fileURL;
    }
  }
}
