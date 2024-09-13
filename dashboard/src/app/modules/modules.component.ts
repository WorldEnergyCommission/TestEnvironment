import { trigger, transition, style, animate } from "@angular/animations";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { SlideElement, UserData } from "src/data-types/userData";

@Component({
    selector: 'app-modules',
    templateUrl: './modules.component.html',
    styleUrls: ['./modules.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('carouselAnimation', [
            transition('void => *', [
                style({ opacity: 0 }),
                animate('1300ms', style({ opacity: 1 }))
            ])
        ])
    ]
})
export class ModulesComponent {
    @Input() dashboard?: boolean;
    @Input() id: string = '';
    @Input() userData?: UserData;
    @Input() module?: SlideElement;

    getId(id: string) {
        return (this.dashboard) ? id + '-dashboard' : id;
    }
}