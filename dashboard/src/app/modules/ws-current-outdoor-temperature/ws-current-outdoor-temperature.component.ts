import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';

@Component({
  selector: 'app-ws-current-outdoor-temperature',
  templateUrl: './ws-current-outdoor-temperature.component.html',
  styleUrls: ['./ws-current-outdoor-temperature.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WsCurrentOutdoorTemperatureComponent
  extends AbstractModuleComponent
  implements OnInit
{
  titleFontSize = '1.3vh';
  numberFontSize = '3vh';
  temperature = 0;
  icon = '';

  updateFontSize(): void {
    const size = this.getSize();
    if (size) {
      const fontSize =
        (Math.min(size.width, size.height * 7) * 0.6 + size.height) / 27;
      this.titleFontSize = fontSize + 'px';
      this.numberFontSize = fontSize * 2.5 + 'px';
      this.cdr.detectChanges();
    }
  }

  refreshData(data: ModuleData): void {
    this.temperature = Math.round(
      data.ws_current_outdoor_temperature?.temperature ?? 0
    );
    this.icon = this.getIconUrl(data.ws_current_outdoor_temperature?.icon);
    this.cdr.detectChanges();
  }

  getIconUrl(str?: string): string {
    if (str) {
      const id = str.slice(0, 2);
      return `assets/weather-icons/${id}.png`;
    }

    return '';
  }
}
