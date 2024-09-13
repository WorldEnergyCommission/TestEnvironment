import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';

@Component({
  selector: 'app-today-overview',
  templateUrl: './today-overview.component.html',
  styleUrls: ['./today-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodayOverviewComponent
  extends AbstractModuleComponent
  implements OnInit
{
  @Input() isSummedUp = false;
  textFontSize = '1.3vh';
  iconFontSize = '1.3vh';

  power_f = 0;
  grid_consumption = 0;
  grid_feed_in = 0;

  // Template layouting state
  graphHeight = '20px';
  graphWidth = 20;
  titleFontSize = '1.3vh';
  numberFontSize = '3vh';

  updateFontSize(): void {
    // const size = this.getSize();
    // if (size) {
    //   const fontSize = (size.width * 0.7 + size.height) / 40;
    //   this.titleFontSize = fontSize * 1.5 + 'px';
    //   this.textFontSize = fontSize * 0.7 + 'px';
    //   const icon = size.width * 0.3 * 0.65;
    //   this.iconFontSize = icon + 'px';
    //   this.cdr.detectChanges();
    // }
    const size = this.getSize();
    if (size) {
      const fontSize = (size.width * 0.7 + size.height) / 30;
      this.titleFontSize = fontSize + 'px';
      this.numberFontSize = fontSize / 1.2 + 'px';
      this.textFontSize = fontSize / 1.6 + 'px';
      this.graphHeight = (fontSize / 1.2) * 2 + 'px';
      this.graphWidth = size.width * 0.5;
      this.cdr.detectChanges();
    }
  }

  getTitle() {
    return 'Tagesbilanz';
  }

  getIcon() {
    return 'fa-solid fa-bolt';
  }

  refreshData(data: ModuleData): void {
    const d = this.isSummedUp
      ? data.report_for_all_projects
      : data.report_for_current_project;

    this.power_f = Math.round(Math.abs(d?.today?.pv ?? 0));
    this.grid_consumption = Math.round(
      Math.abs(d?.today?.grid_consumption ?? 0)
    );
    this.grid_feed_in = Math.round(Math.abs(d?.today?.grid_feed_in ?? 0));
    this.cdr.detectChanges();
  }

  formatKWattHours(n: number): string {
    if (Math.abs(n) > 999 || n === 0) {
      return Math.round(n / 1000) + ' MWh';
    }
    return Math.round(n) + ' kWh';
  }

  get energy() {
    const energies = [] as {
      title: string;
      val: number;
      val_formatted: string;
    }[];

    if (this.power_f != 0) {
      energies.push({
        title: 'PV Produktion',
        val: this.power_f,
        val_formatted: this.formatKWattHours(this.power_f),
      });
    }

    if (this.grid_consumption != 0) {
      energies.push({
        title: 'Netzverbrauch',
        val: this.grid_consumption,
        val_formatted: this.formatKWattHours(this.grid_consumption),
      });
    }

    if (this.grid_feed_in != 0) {
      energies.push({
        title: 'Netzeinspeisung',
        val: this.grid_feed_in,
        val_formatted: this.formatKWattHours(this.grid_feed_in),
      });
    }

    return energies
  }

  getGraphWidth(x: number): string {
    const max = this.energy.reduce((prev, current) =>
      prev.val > current.val ? prev : current
    );
    if (max.val === x) {
      return this.graphWidth + 'px';
    } else {
      return (this.graphWidth * x) / max.val + 'px';
    }
  }
}
