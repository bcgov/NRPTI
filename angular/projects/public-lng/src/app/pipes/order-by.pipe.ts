import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {
  transform(records: any[], args: any): any {
    if (!args.property || !args.direction) {
      return records;
    }

    return records.sort((a, b) => {
      if (!args) {
        return 0;
      }

      let aCompare = a[args.property] || '';
      let bCompare = b[args.property] || '';

      if (typeof aCompare === 'object' && !(aCompare instanceof Date) && typeof aCompare === typeof bCompare) {
        // MBL TODO: Assume name for sub-property.  Fix this to be more generic.
        if (aCompare.name === undefined) {
          return 0;
        }

        aCompare = aCompare.name;
        bCompare = bCompare.name;
      }

      if (typeof aCompare === 'string' && typeof aCompare === typeof bCompare) {
        aCompare = aCompare.toUpperCase();
        bCompare = bCompare.toUpperCase();
      }

      if (aCompare < bCompare) {
        return -1 * args.direction;
      }

      if (aCompare > bCompare) {
        return 1 * args.direction;
      }

      return 0;
    });
  }
}
