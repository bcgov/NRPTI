import { Pipe, PipeTransform } from '@angular/core';

//
// Filter to change newlines to HTML linebreaks.
//
@Pipe({
  name: 'newlines'
})
export class NewlinesPipe implements PipeTransform {
  transform(value: string): string {
    const input = value || '';
    return input.replace(/\n/g, '<br />');
  }
}
