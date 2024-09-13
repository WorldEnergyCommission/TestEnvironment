import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PvAggregatedProducedEnergyLastThreeDaysComponent } from './pv-aggregated-produced-energy-last-three-days.component';

describe('PvAggregatedProducedEnergyLastThreeDaysComponent', () => {
  let component: PvAggregatedProducedEnergyLastThreeDaysComponent;
  let fixture: ComponentFixture<PvAggregatedProducedEnergyLastThreeDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PvAggregatedProducedEnergyLastThreeDaysComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PvAggregatedProducedEnergyLastThreeDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
