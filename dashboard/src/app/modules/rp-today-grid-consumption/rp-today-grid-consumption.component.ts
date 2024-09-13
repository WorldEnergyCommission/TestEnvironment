import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';

@Component({
  selector: 'app-rp-today-grid-consumption',
  templateUrl: './rp-today-grid-consumption.component.html',
  styleUrls: ['./rp-today-grid-consumption.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RpTodayGridConsumptionComponent
  extends AbstractModuleComponent
  implements OnInit
{
  consumption = 0;
  feed_in = 0;
  titleFontSize = '3vh';
  textFontSize = '1.3vh';
  numberFontSize = '1.3vh';

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
    this.consumption = Math.round(data.report_for_current_project?.today?.grid_consumption ?? 0);
    this.feed_in = Math.round(data.report_for_current_project?.today?.grid_feed_in ?? 0);
    this.cdr.detectChanges();
  }
}
