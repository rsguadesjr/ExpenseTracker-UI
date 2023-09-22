import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent implements OnInit {
  options: any;
  data: { labels: string[]; datasets: any[] } = { labels: [], datasets: [] };

  @Input() set datasets(value: any[]) {
    this.data = { ...this.data, datasets: value };
  }

  @Input() set labels(value: string[]) {
    this.data = { ...this.data, labels: value };
  }

  @Input() type: 'line' | 'bar' | 'pie' = 'line';
  @Input() aspectRatio: number | null = null;
  @Input() showLegend: boolean = true;
  @Input() showXGrid = true;
  @Input() showYGrid = true;
  @Input() orientation: 'vertical' | 'horizontal' = 'vertical';

  ngOnInit() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.options = {
      indexAxis: this.orientation === 'vertical' ? 'x' : 'y',
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: this.aspectRatio,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
          display: this.showLegend,
        },
      },

      elements: {
        point: {
          radius: 2,
        },
      },
      onClick: function (event: any, elements: any, chart: any) {
        if (elements[0]) {
          const i = elements[0].index;
        }
      },
    };

    if (this.showXGrid) {
      let scales = {
        ...this.options.scales,
        x: {
          // stacked: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
      };
      this.options = { ...this.options, scales };
    }

    if (this.showYGrid) {
      let scales = {
        ...this.options.scales,
        y: {
          // stacked: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
      };
      this.options = { ...this.options, scales };
    }
  }
}
