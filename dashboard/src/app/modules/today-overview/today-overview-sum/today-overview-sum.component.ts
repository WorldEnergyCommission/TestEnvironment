import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractModuleComponent } from '../../abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';

@Component({
  selector: 'app-today-overview-sum',
  templateUrl: './today-overview-sum.component.html',
  styleUrls: ['./today-overview-sum.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodayOverviewSumComponent extends AbstractModuleComponent {

  updateFontSize() {}

  refreshData(data: ModuleData): void {
    this.cdr.detectChanges();
  }
}
