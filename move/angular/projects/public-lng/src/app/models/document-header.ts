export class DocumentHeader {
  displayName: string;
  fieldName: string;

  constructor(obj?: any) {
    this.displayName = (obj && obj.displayName) || null;
    this.fieldName = (obj && obj.fieldName) || null;
  }
}
