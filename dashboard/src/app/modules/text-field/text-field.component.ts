import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';

@Component({
  selector: 'app-text-field',
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextFieldComponent extends AbstractModuleComponent implements OnInit {
  fontSize = '1.3vh';
  @Input() text? = '';

  updateFontSize(): void {
    const size = this.getSize();
    if (size) {
      const fontSize = (size.width + size.height) / 17;
      this.fontSize = fontSize + 'px';
      this.cdr.detectChanges();
    }
  }

  refreshData(): void {
  }

}
