import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {
  transform(records: any[], args: any): any[] {
    if (!args.property || !args.direction) {
      return records;
    }

    return records.sort((a, b) => {
      if (!args) {
        return 0;
      }

      let aCompare = a[args.property];
      let bCompare = b[args.property];

      // put null values first
      if (!aCompare) {
        return -args.direction;
      }
      if (!bCompare) {
        return +args.direction;
      }

      if (Array.isArray(aCompare) || Array.isArray(bCompare)) {
        // just compare first elements
        aCompare = this.coalesce(aCompare[0]);
        bCompare = this.coalesce(bCompare[0]);
      } else if (typeof aCompare === 'object' || typeof bCompare === 'object') {
        // put undefined values first
        // MBL TODO: Assume name for sub-property.  Fix this to be more generic.
        if (aCompare.name === undefined) {
          return +args.direction;
        }
        if (bCompare.name === undefined) {
          return -args.direction;
        }

        aCompare = this.coalesce(aCompare.name);
        bCompare = this.coalesce(bCompare.name);
      }

      if (aCompare < bCompare) {
        return -args.direction;
      }
      if (aCompare > bCompare) {
        return +args.direction;
      }
      return 0;
    });
  }

  // coalesce literals to a base value
  private coalesce(obj: any): any {
    if (typeof obj === 'string') {
      return obj ? obj.toLowerCase() : 0;
    }
    return obj || 0;
  }
}
