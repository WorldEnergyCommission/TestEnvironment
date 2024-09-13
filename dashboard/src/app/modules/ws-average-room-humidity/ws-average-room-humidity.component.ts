import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';

@Component({
  selector: 'app-ws-average-room-humidity',
  templateUrl: './ws-average-room-humidity.component.html',
  styleUrls: ['./ws-average-room-humidity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WsAverageRoomHumidityComponent extends AbstractModuleComponent implements OnInit {
  titleFontSize = '1.3vh';
  numberFontSize = '3vh';
  humidity = 0;

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
    this.humidity = data.ws_average_room_humidity ?? 0;
    this.cdr.detectChanges();
  }
}
