import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodayOverviewComponent } from './today-overview/today-overview.component';
import { TodayOverviewSumComponent } from './today-overview-sum/today-overview-sum.component';

@NgModule({
  declarations: [TodayOverviewComponent, TodayOverviewSumComponent],
  imports: [CommonModule],
  exports: [TodayOverviewComponent, TodayOverviewSumComponent],
})
export class TodayOverviewModule {}
