import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';

@Component({
  selector: 'app-pv-aggregated-carbon-savings-symbolic',
  templateUrl: './pv-aggregated-carbon-savings-symbolic.component.html',
  styleUrls: ['./pv-aggregated-carbon-savings-symbolic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PvAggregatedCarbonSavingsSymbolicComponent extends AbstractModuleComponent implements OnInit {
  titleFontSize = '3vh';
  textFontSize = '1.3vh';
  numberFontSize = '1.3vh';
  today = 0;
  overall = 0;


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
    const energyData = data.pv_aggregated_power;
    if (energyData) {
      this.today = Math.floor((energyData.today ?? 0) / this.getRatio());
      this.overall = Math.floor((energyData.overall ?? 0) / this.getRatio());
      this.cdr.detectChanges();
    }
  }

  getRatio(): number {
    return this.userData?.pv_aggregated_carbon_savings_symbolic_ratio ?? 0.2;
  }
}
