import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PvAggregatedCarbonSavingsSymbolicComponent } from './pv-aggregated-carbon-savings-symbolic.component';

describe('PvAggregatedCarbonSavingsSymbolicComponent', () => {
  let component: PvAggregatedCarbonSavingsSymbolicComponent;
  let fixture: ComponentFixture<PvAggregatedCarbonSavingsSymbolicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PvAggregatedCarbonSavingsSymbolicComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PvAggregatedCarbonSavingsSymbolicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
