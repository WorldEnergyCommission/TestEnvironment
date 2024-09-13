import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentPowerComponent } from './current-power/current-power.component';

@NgModule({
  declarations: [CurrentPowerComponent],
  imports: [CommonModule],
  exports: [CurrentPowerComponent],
})
export class CurrentPowerModule {}
