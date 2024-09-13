import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PvAggregatedCurrentPowerComponent } from './pv-aggregated-current-power.component';

describe('aktuelleLeistungComponent', () => {
  let component: PvAggregatedCurrentPowerComponent;
  let fixture: ComponentFixture<PvAggregatedCurrentPowerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PvAggregatedCurrentPowerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PvAggregatedCurrentPowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
