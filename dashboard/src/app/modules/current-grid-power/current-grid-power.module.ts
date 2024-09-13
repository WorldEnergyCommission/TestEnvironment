import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentGridPowerComponent } from './current-grid-power/current-grid-power.component';
import { CurrentGridPowerSumComponent } from './current-grid-power-sum/current-grid-power-sum.component';

@NgModule({
  declarations: [CurrentGridPowerComponent, CurrentGridPowerSumComponent],
  imports: [CommonModule],
  exports: [CurrentGridPowerComponent, CurrentGridPowerSumComponent],
})
export class CurrentGridPowerModule {}
