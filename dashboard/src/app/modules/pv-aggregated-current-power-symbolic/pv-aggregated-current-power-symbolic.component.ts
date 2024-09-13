import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';

@Component({
  selector: 'app-pv-aggregated-current-power-symbolic',
  templateUrl: './pv-aggregated-current-power-symbolic.component.html',
  styleUrls: ['./pv-aggregated-current-power-symbolic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PvAggregatedCurrentPowerSymbolicComponent extends AbstractModuleComponent {
  fontSize = '3vh';
  led = 0;

  updateFontSize(): void {
    const size = this.getSize();
    if (size) {
      const fontSize =
        (Math.min(size.width, size.height * 3) + size.height) / 33;
      this.fontSize = fontSize + 'px';
      this.cdr.detectChanges();
    }
  }

  refreshData(data: ModuleData): void {
    this.led = (data.pv_aggregated_current_power ?? 0) * 100;
    this.cdr.detectChanges();
  }
}
