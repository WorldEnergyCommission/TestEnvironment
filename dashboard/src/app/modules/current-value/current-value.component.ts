import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';
@Component({
  selector: 'app-current-value',
  templateUrl: './current-value.component.html',
  styleUrls: ['./current-value.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentValueComponent
  extends AbstractModuleComponent
  implements OnInit
{
  @Input() icon = 'fa-solid fa-bolt';
  @Input() title = 'Title';
  @Input() unit = 'unit';
  @Input() variable = 'variable';
  titleFontSize = '3vh';
  numberFontSize = '3vh';
  power = '0';

  refreshData(data: ModuleData): void {
    const variablesData = data.otherVars ?? {};
    this.power = (variablesData[this.variable] ?? 0).toFixed(2);
    this.cdr.detectChanges();
  }

  updateFontSize(): void {
    const size = this.getSize();
    if (size) {
      const fontSize =
        (Math.min(size.width, size.height * 3) * 0.7 + size.height) / 30;
      this.titleFontSize = fontSize + 'px';
      this.numberFontSize = fontSize * 2.5 + 'px';
      this.cdr.detectChanges();
    }
  }
}
