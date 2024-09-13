import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData, ReportMeasurementsWeek } from 'src/data-types/moduleData';

@Component({
  selector: 'app-last-seven-days-chart-sum',
  templateUrl: './last-seven-days-chart-sum.component.html',
  styleUrls: ['./last-seven-days-chart-sum.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastSevenDaysChartSumComponent
  extends AbstractModuleComponent
  implements OnInit
{
  protected sum?: ReportMeasurementsWeek;

  updateFontSize() {}

  refreshData(data: ModuleData): void {
    this.sum = data.report_for_all_projects?.week;
    this.cdr.detectChanges();
  }
}
