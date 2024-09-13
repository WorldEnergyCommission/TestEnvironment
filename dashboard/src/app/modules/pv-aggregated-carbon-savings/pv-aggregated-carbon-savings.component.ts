import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';
import * as moment from 'moment';
import 'moment-timezone';

@Component({
  selector: 'app-pv-aggregated-carbon-savings',
  templateUrl: './pv-aggregated-carbon-savings.component.html',
  styleUrls: ['./pv-aggregated-carbon-savings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PvAggregatedCarbonSavingsComponent extends AbstractModuleComponent implements OnInit {
  titleFontSize = '3vh';
  highlightedNumberFontSize = '1.3vh';
  numberFontSize = '1.3vh';
  tons = 0;
  kgs = 0;

  updateFontSize(): void {
    const size = this.getSize();
    if (size) {
      const fontSize = (size.width * 0.7 + size.height) / 40;
      this.titleFontSize = fontSize + 'px';
      this.highlightedNumberFontSize = fontSize * 1.2 + 'px';
      this.numberFontSize = fontSize / 2 + 'px';
      this.cdr.detectChanges();
    }
  }

  refreshData(data: ModuleData): void {
    const carbonSavings = data.pv_aggregated_power;
    if (carbonSavings) {
      this.tons = Math.round((carbonSavings.overall ?? 0) * this.getRatio() / 1000);
      this.kgs = Math.round((carbonSavings.today ?? 0) * this.getRatio());
      this.cdr.detectChanges();
    }
  }

  getYear(): number {
    if (this.userData) {
      return moment().tz(this.userData.timezone).year();
    }
    return moment().year();
  }

  getRatio(): number {
    return this.userData?.pv_aggregated_carbon_savings_ratio ?? 0.2;
  }

}
