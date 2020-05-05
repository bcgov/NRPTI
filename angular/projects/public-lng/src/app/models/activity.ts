import { ActivityTypes } from '../../../../global/src/lib/utils/activity-types.enum';

export class Activity {
  type: string;
  title: string;
  description: string;
  date: Date;
  url: string;

  constructor(obj?: any) {
    this.type = (obj && obj.type && ActivityTypes[obj.type]) || ActivityTypes.INFO;
    this.title = (obj && obj.title) || null;
    this.url = (obj && obj.url) || null;
    this.description = (obj && obj.description) || null;
    this.date = (obj && obj.date && new Date(obj.date)) || null;
  }
}
