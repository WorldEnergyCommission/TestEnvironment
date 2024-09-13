import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WsCurrentOutdoorTemperatureComponent } from './ws-current-outdoor-temperature.component';

@NgModule({
  declarations: [
    WsCurrentOutdoorTemperatureComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    WsCurrentOutdoorTemperatureComponent
  ]
})
export class WsCurrentOutdoorTemperatureModule { }
