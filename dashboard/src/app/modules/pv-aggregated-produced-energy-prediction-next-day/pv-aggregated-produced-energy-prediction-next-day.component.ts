import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';
@Component({
  selector: 'app-pv-aggregated-produced-energy-prediction-next-day',
  templateUrl:
    './pv-aggregated-produced-energy-prediction-next-day.component.html',
  styleUrls: [
    './pv-aggregated-produced-energy-prediction-next-day.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PvAggregatedProducedEnergyPredictionNextDayComponent
  extends AbstractModuleComponent
  implements OnInit
{
  titleFontSize = '1.3vh';
  numberFontSize = '3vh';
  energy = 0;

  updateFontSize(): void {
    const size = this.getSize();
    if (size) {
      const fontSize =
        (Math.min(size.width, size.height * 3) * 0.7 + size.height) / 30;
      this.titleFontSize = fontSize + 'px';
      this.numberFontSize = fontSize * 2.5 + 'px';
      this.cdr.detectChanges();
    }
  }

  refreshData(data: ModuleData): void {
    this.energy = data.pv_aggregated_produced_energy_prediction_next_day ?? 0;
    this.cdr.detectChanges();
  }
}
