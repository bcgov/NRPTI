import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {v4 as uuidv4} from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private _messages = new BehaviorSubject<any[]>([]);
  private dataStore: { messages: any[] } = { messages: [] };

  get messages() {
    return this._messages.asObservable();
  }

  addMessage(body: string, title: string, type: number) {
    this.dataStore.messages.push({
      body: body,
      title: title,
      type: type,
      guid: uuidv4(),
      date: new Date().toISOString()
    });
    // tslint:disable-next-statement
    this._messages.next(Object.assign({}, this.dataStore).messages);
  }

  // Allow messages to be removed once displayed
  removeMessage(guid: string) {
    const newList = this.dataStore.messages.filter(item => item.guid !== guid);
    this.dataStore.messages = newList;
  }
}
