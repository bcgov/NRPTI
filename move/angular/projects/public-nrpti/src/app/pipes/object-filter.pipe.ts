import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'objectFilter'
})
export class ObjectFilterPipe implements PipeTransform {
  transform(value: any[], q: string) {
    if (!q || q === '') {
      return value;
    }
    return value.filter(item => -1 < item.name.toLowerCase().indexOf(q.toLowerCase()));
  }
}
