import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WsAverageRoomHumidityComponent } from './ws-average-room-humidity.component';

@NgModule({
  declarations: [
    WsAverageRoomHumidityComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    WsAverageRoomHumidityComponent
  ]
})
export class WsAverageRoomHumidityModule { }
