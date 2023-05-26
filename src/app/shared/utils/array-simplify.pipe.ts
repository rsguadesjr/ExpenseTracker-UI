import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arraySimplify',
  standalone: true
})
export class ArraySimplifyPipe implements PipeTransform {

  transform(array: any, field: string): any[] {
    if (!Array.isArray(array) || !field) {
      return [];
    }

    return  array.map(x => x[field]);
  }

}
