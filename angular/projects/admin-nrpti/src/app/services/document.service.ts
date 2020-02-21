import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ApiService } from './api.service';
import { Document } from '../../../../common/src/app/models/document';
import { HttpClient } from '@angular/common/http';


/**
 * Provides methods for retrieving and working with documents.
 *
 * @export
 * @class DocumentService
 */
@Injectable({ providedIn: 'root' })
export class DocumentService {
  constructor(
    public apiService: ApiService,
    public http: HttpClient
  ) { }

  /**
   * Return all documents that match the provided filters.
   *
   * @param {IRecordQueryParamSet[]} queryParamSet array of query parameter sets.
   * @returns {Observable<Document[]>} total results from all query param sets. Not guaranteed to be unique.
   * @memberof DocumentService
   */
  public getAll(/* queryParamSets: IDocumentQueryParamSet[] */): Observable<Document[]> {
    return of([] as Document[]);
  }

  /**
   * Get a count of all documents that match the provided filters.
   *
   * @param {IRecordQueryParamSet[]} queryParamSet array of query parameter sets.
   * @returns {Observable<number>} total results from all query param sets. Not guaranteed to be unique.
   * @memberof DocumentService
   */
  public getCount(/* queryParamSets: IDocumentQueryParamSet[] */): Observable<number> {
    return of(0);
  }

  createDocument(document: Document): Observable<object> {
    const queryString = 'document';
    return this.http.put<object>(`${this.apiService.pathAPI}/${queryString}`, document, {});
  }


  private downloadResource(id: string): Promise<Blob> {
    const queryString = `document/${id}/download`;
    return this.http.get<Blob>(
      this.apiService.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }
    ).toPromise();
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

  public uploadFileToS3(s3Url: string, formData: FormData): Promise<any> {
    const httpOptions = {
      // headers: new HttpHeaders({
      //   'x-emc-namespace': 'nrs'
      // })
    };
    return this.http.put<any>(`${s3Url}`, formData, httpOptions).toPromise();
  }
}
