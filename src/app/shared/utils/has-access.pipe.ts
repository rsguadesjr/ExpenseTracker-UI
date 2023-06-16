import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasAccess',
  standalone: true
})
export class HasAccessPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
