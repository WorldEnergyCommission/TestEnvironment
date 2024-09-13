import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartDataset,
  Legend,
  LinearScale,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleDataService } from 'src/app/services/module-data.service';
import { getShadesOfColor } from 'src/app/utils/chart';
import { ModuleData, ReportMeasurementsWeek } from 'src/data-types/moduleData';

@Component({
  selector: 'app-last-seven-days-chart',
  templateUrl: './last-seven-days-chart.component.html',
  styleUrls: ['./last-seven-days-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastSevenDaysChartComponent
  extends AbstractModuleComponent
  implements OnInit, OnDestroy
{
  @Input() isSummedUp = false;
  @Input() sum?: ReportMeasurementsWeek;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef;
  protected chart?: Chart<'bar'>;

  titleFontSize = '1.3vh';
  numberFontSize = '3vh';
  infoFontSize = '1.3vh';
  avgPVNum = 0;
  averagePVProduction = '0';
  avgGridConNum = 0;
  averageGridConsumtion = '0';
  avgGridFeedNum = 0;
  averageGridFeedIn = '0';

  constructor(moduleDataService: ModuleDataService, cdr: ChangeDetectorRef) {
    super(moduleDataService, cdr);
    Chart.register(
      BarController,
      BarElement,
      CategoryScale,
      LinearScale,
      Legend
      // ChartDataLabels
    );
  }

  updateFontSize(): void {
    const size = this.getSize();
    if (size) {
      const fontSize = (size.width * 0.7 + size.height) / 30;
      this.titleFontSize = fontSize + 'px';
      this.numberFontSize = fontSize / 1.4 + 'px';
      this.infoFontSize = fontSize / 2.2 + 'px';
      this.cdr.detectChanges();
    }
  }

  refreshData(data: ModuleData): void {
    this.refreshAverages(
      this.isSummedUp ? this.sum : data.report_for_current_project?.week
    );
    this.setDataForChart(
      this.isSummedUp ? this.sum : data.report_for_current_project?.week
    );
    this.cdr.detectChanges();
  }

  formatKWattHours(n: number): string {
    if (Math.abs(n) > 999 || n === 0) {
      return Math.round(n / 1000) + ' MWh';
    }
    return Math.round(n) + ' kWh';
  }

  refreshAverages(data?: ReportMeasurementsWeek) {
    if (data && data.pv) {
      this.avgPVNum = Math.round(
        Object.values(data.pv).reduce((a, b) => a + b, 0) / 7
      );
      this.averagePVProduction = this.formatKWattHours(this.avgPVNum);
    }
    if (data && data.grid_consumption) {
      this.avgGridConNum = Math.round(
        Object.values(data.grid_consumption).reduce((a, b) => a + b, 0) / 7
      );
      this.averageGridConsumtion = this.formatKWattHours(this.avgGridConNum);
    }
    if (data && data.grid_feed_in) {
      this.avgGridFeedNum = Math.round(
        Object.values(data.grid_feed_in).reduce((a, b) => a + b, 0) / 7
      );
      this.averageGridFeedIn = this.formatKWattHours(this.avgGridFeedNum);
    }
  }

  setDataForChart(data?: ReportMeasurementsWeek) {
    const datasets: ChartDataset<'bar', number[]>[] = [];
    let dates: string[] = [];

    const shades = getShadesOfColor(this.userData?.colors.secondary, 3);

    if (data?.grid_consumption && this.avgGridConNum != 0) {
      if (!dates.length) {
        dates = Object.keys(data.grid_consumption);
      }
      datasets.push({
        type: 'bar',
        label: 'Netzverbrauch',
        data: Object.values(data.grid_consumption),
        backgroundColor: shades[0],
      });
    }
    if (data?.grid_feed_in && this.avgGridFeedNum != 0) {
      if (!dates.length) {
        dates = Object.keys(data.grid_feed_in);
      }
      datasets.push({
        type: 'bar',
        label: 'Netzeinspeisung',
        data: Object.values(data.grid_feed_in),
        backgroundColor: shades[1],
      });
    }
    if (data?.pv && this.avgPVNum != 0) {
      if (!dates.length) {
        dates = Object.keys(data.pv);
      }
      datasets.push({
        type: 'bar',
        label: 'PV Produktion',
        data: Object.values(data.pv),
        backgroundColor: shades[2],
      });
    }

    const labels = dates.map((date) =>
      new Date(Number(date) * 1000).toLocaleDateString()
    );

    const $t = this;
    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets = datasets;
      this.chart.update();
    } else {
      this.chart = new Chart<'bar', number[]>(
        this.canvasElement.nativeElement,
        {
          type: 'bar',
          data: {
            labels: labels,
            datasets: datasets,
          },
          options: {
            scales: {
              y: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: this.userData?.colors.default,
                  // display: false,
                  callback: function (value) {
                    const v = value as number;
                    return $t.formatKWattHours(v);
                  },
                },
                border: {
                  display: false,
                },
              },
              x: {
                grid: {
                  color: this.userData?.colors.default,
                },
                ticks: {
                  color: this.userData?.colors.default,
                },
                border: {
                  display: false,
                },
              },
            },
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: this.userData?.colors.default,
                  usePointStyle: true,
                },
              },
              // datalabels: {
              //   color: this.userData?.colors.default,
              //   formatter: function (value, context) {
              //     return Math.abs(Math.round(value)) + ' kWh';
              //   },
              //   rotation: 270,
              //   align: 'end',
              // },
            },
          },
          // plugins: [ChartDataLabels],
        }
      );
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.chart?.destroy();
  }
}
