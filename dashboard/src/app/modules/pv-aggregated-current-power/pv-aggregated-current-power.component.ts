import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';
@Component({
  selector: 'app-pv-aggregated-current-power',
  templateUrl: './pv-aggregated-current-power.component.html',
  styleUrls: ['./pv-aggregated-current-power.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PvAggregatedCurrentPowerComponent extends AbstractModuleComponent implements OnInit {
  titleFontSize = '3vh';
  textFontSize = '1.3vh';
  power = 0;

  updateFontSize(): void {
    const size = this.getSize();
    if (size) {
      const fontSize = (size.width * 0.7 + size.height) / 50;
      this.titleFontSize = fontSize * 2.5 + 'px';
      this.textFontSize = fontSize + 'px';
      this.cdr.detectChanges();
    }
  }

  refreshData(data: ModuleData): void {
    this.power = data.pv_aggregated_current_power ?? 0;
    this.cdr.detectChanges();
  }
}
