import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';
@Component({
  selector: 'app-ws-average-room-temperature',
  templateUrl: './ws-average-room-temperature.component.html',
  styleUrls: ['./ws-average-room-temperature.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WsAverageRoomTemperatureComponent extends AbstractModuleComponent implements OnInit {
  titleFontSize = '1.3vh';
  numberFontSize = '3vh';
  temperature = 0;

  updateFontSize(): void {
    const size = this.getSize();
    if (size) {
      const fontSize = (size.width * 0.6 + size.height) / 27;
      this.titleFontSize = fontSize + 'px';
      this.numberFontSize = fontSize * 2.5 + 'px';
      this.cdr.detectChanges();
    }
  }

  refreshData(data: ModuleData): void {
    this.temperature = data.ws_average_room_temperature ?? 0;
    this.cdr.detectChanges();
  }
}


