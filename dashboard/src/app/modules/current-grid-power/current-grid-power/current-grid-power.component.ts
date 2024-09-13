import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData } from 'src/data-types/moduleData';

@Component({
  selector: 'app-current-grid-power',
  templateUrl: './current-grid-power.component.html',
  styleUrls: ['./current-grid-power.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentGridPowerComponent
  extends AbstractModuleComponent
  implements OnInit
{
  @Input() isSummedUp = false;
  @Input() sum = 0;
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
    if (!this.isSummedUp) {
      this.power = (data.report_for_current_project?.live?.grid ?? 0).toFixed(2);
      this.cdr.detectChanges();
    }
  }
}
