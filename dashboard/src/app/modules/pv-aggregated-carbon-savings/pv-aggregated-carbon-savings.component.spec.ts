import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PvAggregatedCarbonSavingsComponent } from './pv-aggregated-carbon-savings.component';

describe('PvAggregatedCarbonSavingsComponent', () => {
  let component: PvAggregatedCarbonSavingsComponent;
  let fixture: ComponentFixture<PvAggregatedCarbonSavingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PvAggregatedCarbonSavingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PvAggregatedCarbonSavingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
