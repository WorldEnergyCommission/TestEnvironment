import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';

@Component({
  selector: 'app-current-power',
  templateUrl: './current-power.component.html',
  styleUrls: ['./current-power.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentPowerComponent
  extends AbstractModuleComponent
  implements OnInit
{
  @Input() icon = 'fa-solid fa-bolt';
  @Input() title = 'Title';
  @Input() subtitle = 'Subtitle';
  @Input() variable = 'variable';
  titleFontSize = '3vh';
  textFontSize = '1.3vh';
  iconFontSize = '1.3vh';
  power = '0';

  updateFontSize(): void {
    const size = this.getSize();
    if (size) {
      const fontSize = (size.width * 0.7 + size.height) / 40;
      this.titleFontSize = fontSize * 1.5 + 'px';
      this.textFontSize = fontSize * 0.7 + 'px';
      const icon = size.width * 0.3 * 0.65;
      this.iconFontSize = icon + 'px';
      this.cdr.detectChanges();
    }
  }

  refreshData(data: ModuleData): void {
    const variablesData = data.otherVars ?? {};
    this.power = (variablesData[this.variable] ?? 0).toFixed(2);
    this.cdr.detectChanges();
  }
}
