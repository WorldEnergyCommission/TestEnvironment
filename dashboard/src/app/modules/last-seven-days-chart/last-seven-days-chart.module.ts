import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LastSevenDaysChartComponent } from './last-seven-days-chart/last-seven-days-chart.component';
import { LastSevenDaysChartSumComponent } from './last-seven-days-chart-sum/last-seven-days-chart-sum.component';

@NgModule({
  declarations: [LastSevenDaysChartComponent, LastSevenDaysChartSumComponent],
  imports: [CommonModule],
  exports: [LastSevenDaysChartComponent, LastSevenDaysChartSumComponent],
})
export class LastSevenDaysChartModule {}
