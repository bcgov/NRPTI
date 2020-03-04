/**
 * Legislation schema-field specification.
 *
 * Note: This is not itself a schema.  This is a field of existing schema(s).
 *
 * @class Legislation
 */
export class Legislation {
  act: string;
  regulation: string;
  section: string;
  subSection: string;
  paragraph: string;

  constructor(obj?: any) {
    this.act = (obj && obj.act) || null;
    this.regulation = (obj && obj.regulation) || null;
    this.section = (obj && obj.section) || null;
    this.subSection = (obj && obj.subSection) || null;
    this.paragraph = (obj && obj.paragraph) || null;
  }
}
