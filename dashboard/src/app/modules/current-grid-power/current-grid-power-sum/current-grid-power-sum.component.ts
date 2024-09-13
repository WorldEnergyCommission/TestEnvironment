import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractModuleComponent } from '../../abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';

@Component({
  selector: 'app-current-grid-power-sum',
  templateUrl: './current-grid-power-sum.component.html',
  styleUrls: ['./current-grid-power-sum.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentGridPowerSumComponent extends AbstractModuleComponent {
  sum = 0;

  updateFontSize() {}

  refreshData(data: ModuleData): void {
    this.sum = data.report_for_all_projects?.live?.grid ?? 0;
    this.cdr.detectChanges();
  }
}
