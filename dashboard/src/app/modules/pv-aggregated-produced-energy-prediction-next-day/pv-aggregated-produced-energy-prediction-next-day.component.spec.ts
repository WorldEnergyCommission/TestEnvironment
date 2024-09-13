import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PvAggregatedProducedEnergyPredictionNextDayComponent } from './pv-aggregated-produced-energy-prediction-next-day.component';

describe('PvAggregatedProducedEnergyPredictionNextDayComponent', () => {
  let component: PvAggregatedProducedEnergyPredictionNextDayComponent;
  let fixture: ComponentFixture<PvAggregatedProducedEnergyPredictionNextDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PvAggregatedProducedEnergyPredictionNextDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PvAggregatedProducedEnergyPredictionNextDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
