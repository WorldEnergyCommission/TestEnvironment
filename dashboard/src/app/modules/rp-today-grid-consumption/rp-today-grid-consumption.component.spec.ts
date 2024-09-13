import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RpTodayGridConsumptionComponent } from './rp-today-grid-consumption.component';

describe('RpTodayGridConsumptionComponentGridConsumptionComponentComponent', () => {
  let component: RpTodayGridConsumptionComponent;
  let fixture: ComponentFixture<RpTodayGridConsumptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RpTodayGridConsumptionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RpTodayGridConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
