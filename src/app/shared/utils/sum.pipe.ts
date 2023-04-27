import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sum',
  standalone: true
})
export class SumPipe implements PipeTransform {

  transform(items: any[], prop: string): number {
    if (!items)
      return 0;

    if (prop) {
      items = items.map(x => x[prop]);
    }

    return items.reduce((acc, curr) => acc + curr, 0);
  }

}
