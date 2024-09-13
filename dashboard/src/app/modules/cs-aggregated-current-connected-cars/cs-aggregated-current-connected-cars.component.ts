import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';

@Component({
  selector: 'app-cs-aggregated-current-connected-cars',
  templateUrl: './cs-aggregated-current-connected-cars.component.html',
  styleUrls: ['./cs-aggregated-current-connected-cars.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsAggregatedCurrentConnectedCarsComponent extends AbstractModuleComponent implements OnInit {
  titleFontSize = '3vh';
  textFontSize = '1.3vh';
  numberFontSize = '1.3vh';
  cars = 0;

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
    this.cars = data.cs_aggregated_current_connected_cars ?? 0;
    this.cdr.detectChanges();
  }
}
