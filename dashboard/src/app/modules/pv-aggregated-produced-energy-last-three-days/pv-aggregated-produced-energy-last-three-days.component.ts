import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';

@Component({
  selector: 'app-pv-aggregated-produced-energy-last-three-days',
  templateUrl: './pv-aggregated-produced-energy-last-three-days.component.html',
  styleUrls: ['./pv-aggregated-produced-energy-last-three-days.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PvAggregatedProducedEnergyLastThreeDaysComponent extends AbstractModuleComponent implements OnInit {
  titleFontSize = '1.3vh';
  numberFontSize = '3vh';
  energy: number[] = [];
  graphHeight = '20px';
  graphWidth = 20;

  updateFontSize(): void {
    const size = this.getSize();
    if (size) {
      const fontSize = (size.width * 0.7 + size.height) / 30;
      this.titleFontSize = fontSize + 'px';
      this.numberFontSize = fontSize / 1.2 + 'px';
      this.graphHeight = fontSize / 1.2 * 2 + 'px';
      this.graphWidth = size.width * 0.5;
      this.cdr.detectChanges();
    }
  }

  refreshData(data: ModuleData): void {
    this.energy = data.pv_aggregated_power?.lastThreeDays ?? [0, 0, 0];
    this.cdr.detectChanges();
  }

  getGraphWidth(x: number): string {
    const max = this.energy.reduce((prev, current) => (prev > current) ? prev : current);
    if (max === x) {
      return this.graphWidth + 'px';
    } else {
      return this.graphWidth * x / max + 'px';
    }
  }

}
