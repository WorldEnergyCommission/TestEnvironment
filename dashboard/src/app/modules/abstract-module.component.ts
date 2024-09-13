import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModuleDataService } from 'src/app/services/module-data.service';
import { ModuleData } from 'src/data-types/moduleData';
import { UserData } from 'src/data-types/userData';

@Component({ template: '' })
export abstract class AbstractModuleComponent implements OnInit, OnDestroy {
    @Input() userData?: UserData;
    @Input() name: string = '';
    protected subscription = new Subscription();
    private resizeObserver?: ResizeObserver;

    constructor(protected moduleDataService: ModuleDataService,
        protected cdr: ChangeDetectorRef) {
        this.subscription = this.moduleDataService.getNewData().subscribe((data) => {
            if (data) {
                this.refreshData(data);
            }
        })
    }

    ngOnInit(): void {
        this.refreshData(this.moduleDataService.getData());
        const observedElement = this.getElement();

        this.resizeObserver =
            new ResizeObserver(() => {
                this.updateFontSize();
            });

        if (observedElement) {
            this.resizeObserver.observe(observedElement);
        }
    }

    getSize(): any {
        const element = this.getElement();
        if (element) {
            return {
                height: element.clientHeight,
                width: element.clientWidth
            }
        }

        return null;
    }

    public abstract updateFontSize(): void;

    public abstract refreshData(data: ModuleData): void;

    getElement(): HTMLElement | null {
        if (this.name) {
            const element = document.getElementById(this.name);
            const dashboard = document.getElementById(this.name + '-dashboard');
            if (element) {
                return element;
            }

            if (dashboard) {
                return dashboard;
            }

            return null;
        }
        return null;
    };

    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }

}
