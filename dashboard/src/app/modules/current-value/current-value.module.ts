import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentValueComponent } from './current-value.component';

@NgModule({
  declarations: [
    CurrentValueComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CurrentValueComponent
  ],
})
export class CurrentValueModule { }
