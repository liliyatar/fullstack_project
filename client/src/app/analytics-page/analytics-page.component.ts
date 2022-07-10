import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnalyticsPage } from '../shared/interfaces';
import { AnalyticsService } from '../shared/services/analytics.service';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.css']
})
export class AnalyticsPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gain') gainRef: ElementRef;
  @ViewChild('order') orderRef: ElementRef;

  average: number;
  pending: boolean = true;
  aSub: Subscription;

  constructor(private service: AnalyticsService) { }

  public ngAfterViewInit() {
    const gainConfig: any = {
      label: 'Выручка',
      color: 'rgb(255, 99, 132)',
    };

    const orderConfig: any = {
      label: 'Заказы',
      color: 'rgb(54, 162, 235)',
    };

    this.aSub = this.service.getAnalytics().subscribe({
        next: (data: AnalyticsPage) => {
          this.average = data.average;

          gainConfig.labels = data.chart.map(item => item.label);
          gainConfig.data = data.chart.map(item => item.gain);

          orderConfig.labels = data.chart.map(item => item.label);
          orderConfig.data = data.chart.map(item => item.order);

          // orderConfig.labels.push('11.07.2022');
          // orderConfig.data.push(0);

          const gainCtx = this.gainRef.nativeElement.getContext('2d');
          const orderCtx = this.orderRef.nativeElement.getContext('2d');

          gainCtx.canvas.height = '300px';
          orderCtx.canvas.height = '300px';

          Chart.register(...registerables);

          new Chart(gainCtx, createChartConfig(gainConfig) as any);
          new Chart(orderCtx, createChartConfig(orderConfig) as any);

          this.pending = false;
        }
    });

  }

  ngOnDestroy(): void {
    if (this.aSub) {
      this.aSub.unsubscribe();
    }
  }

}

function createChartConfig({labels, data, label, color}) {
  return {
    type: 'line',
    options: {
      responsive: true,
    },
    data: {
      labels,
      datasets: [
        {
          label,
          data,
          borderColor: color,
          steppedLine: false,
          fill: false
        }
      ]
    }
  };
}