import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { Document } from '../models/document';
import { Utils } from '../utils/utils';

/**
 * TODO: populate this documentation
 *
 * @export
 * @class ApiService
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  public token: string;
  public isMS: boolean; // IE, Edge, etc

  pathAPI: string;
  env: 'local' | 'dev' | 'test' | 'master' | 'prod';

  constructor(public http: HttpClient) {
    const { hostname } = window.location;
    this.isMS = window.navigator.msSaveOrOpenBlob ? true : false;

    switch (hostname) {
      case 'localhost':
        // Local
        this.pathAPI = 'http://localhost:3000/api';
        this.env = 'local';
        break;

      case 'admin-nrpti-dev.pathfinder.gov.bc.ca':
        // Dev
        this.pathAPI = 'https://nrpti-dev.pathfinder.gov.bc.ca/api';
        this.env = 'dev';
        break;

      case 'admin-nrpti-test.pathfinder.gov.bc.ca':
        // Test
        this.pathAPI = 'https://nrpti-test.pathfinder.gov.bc.ca/api';
        this.env = 'test';
        break;

      default:
        // Prod
        this.pathAPI = 'https://nrpti.nrs.gov.bc.ca/api';
        this.env = 'prod';
    }
  }

  /**
   * Send request to start a task.
   *
   * @param {*} obj post body payload
   * @returns {Observable<any>}
   * @memberof ApiService
   */
  // TODO dont use any
  startTask(obj: any): Observable<any> {
    const queryString = 'task';
    return this.http.post<any>(`${this.pathAPI}/${queryString}`, obj, {});
  }

  //
  // Documents
  //

  deleteDocument(doc: Document): Observable<Document> {
    const queryString = `document/${doc._id}`;
    return this.http.delete<Document>(`${this.pathAPI}/${queryString}`, {});
  }

  publishDocument(doc: Document): Observable<Document> {
    const queryString = `document/${doc._id}/publish`;
    return this.http.put<Document>(`${this.pathAPI}/${queryString}`, doc, {});
  }

  unPublishDocument(doc: Document): Observable<Document> {
    const queryString = `document/${doc._id}/unpublish`;
    return this.http.put<Document>(`${this.pathAPI}/${queryString}`, doc, {});
  }

  uploadDocument(formData: FormData): Observable<Document> {
    const fields = ['documentFileName', 'displayName', 'internalURL', 'internalMime'];
    const queryString = `document/?fields=${Utils.convertArrayIntoPipeString(fields)}`;
    return this.http.post<Document>(`${this.pathAPI}/${queryString}`, formData, {});
  }

  private downloadResource(id: string): Promise<Blob> {
    const queryString = `document/${id}/download`;
    return this.http.get<Blob>(this.pathAPI + '/' + queryString, { responseType: 'blob' as 'json' }).toPromise();
  }

  public async downloadDocument(document: Document): Promise<void> {
    const blob = await this.downloadResource(document._id);
    const filename = document.documentFileName;

    if (this.isMS) {
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
    const filename = document.documentFileName;

    if (this.isMS) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      const tab = window.open();
      const fileURL = URL.createObjectURL(blob);
      tab.location.href = fileURL;
    }
  }

  /**
   * General error handler.  Used to transform and log error messages before throwing.
   *
   * @param {*} error
   * @returns {Observable<never>}
   * @memberof ApiService
   */
  handleError(error: any): Observable<never> {
    let errorMessage = 'Unknown Server Error';

    if (error) {
      if (error.message) {
        if (error.error) {
          errorMessage = `${error.message} - ${error.error.message}`;
        } else {
          errorMessage = error.message;
        }
      } else if (error.status) {
        errorMessage = `${error.status} - ${error.statusText}`;
      }
    }

    console.log('Server Error:', errorMessage);
    return throwError(error);
  }
}
