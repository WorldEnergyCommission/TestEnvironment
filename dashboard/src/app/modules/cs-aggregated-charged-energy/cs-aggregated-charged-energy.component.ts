import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';

@Component({
  selector: 'app-cs-aggregated-charged-energy',
  templateUrl: './cs-aggregated-charged-energy.component.html',
  styleUrls: ['./cs-aggregated-charged-energy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsAggregatedChargedEnergyComponent extends AbstractModuleComponent implements OnInit {
  titleFontSize = '3vh';
  textFontSize = '1.3vh';
  numberFontSize = '1.3vh';
  today = 0;
  overall = 0;
  ratio = 7;

  updateFontSize(): void {
    const size = this.getSize();
    if (size) {
      const fontSize = (size.width * 0.7 + size.height) / 40;
      this.titleFontSize = fontSize + 'px';
      this.numberFontSize = fontSize * 1.2 + 'px';
      this.textFontSize = fontSize / 2 + 'px';
      this.cdr.detectChanges();
    }
  }

  refreshData(data: ModuleData): void {
    const energyData = data.cs_aggregated_charged_energy;
    if (energyData) {
      this.today = energyData.today ?? 0;
      this.overall = energyData.overall ?? 0;
      this.cdr.detectChanges();
    }
  }

  getRatio(): number {
    return this.userData?.cs_aggregated_charged_energy_ratio ?? 7;
  }
}
