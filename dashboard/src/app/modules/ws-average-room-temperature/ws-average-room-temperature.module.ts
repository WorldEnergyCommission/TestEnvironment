import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WsAverageRoomTemperatureComponent } from './ws-average-room-temperature.component';

@NgModule({
  declarations: [
    WsAverageRoomTemperatureComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    WsAverageRoomTemperatureComponent
  ]
})
export class WsAverageRoomTemperatureModule { }
