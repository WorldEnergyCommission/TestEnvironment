import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';
import { ModuleData, ProjectState } from 'src/data-types/moduleData';

@Component({
  selector: 'app-project-state-overview',
  templateUrl: './project-state-overview.component.html',
  styleUrls: ['./project-state-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectStateOverviewComponent
  extends AbstractModuleComponent
  implements OnInit
{
  fontSize = '1.3vh';
  highlightedNumberFontSize = '1.3vh';
  state: ProjectState = {
    total: 0,
    errors: 0,
    warnings: 0,
    noErrors: 0,
  };

  updateFontSize(): void {
    const size = this.getSize();
    if (size) {
      const fontSize =
        (Math.min(size.width, size.height * 3) * 0.7 + size.height) / 30;
      this.fontSize = fontSize + 'px';
      this.highlightedNumberFontSize = fontSize * 3 + 'px';
      this.cdr.detectChanges();
    }
  }

  refreshData(data: ModuleData): void {
    if (data.project_state) {
      this.state = data.project_state;
      this.cdr.detectChanges();
    }
  }
}
