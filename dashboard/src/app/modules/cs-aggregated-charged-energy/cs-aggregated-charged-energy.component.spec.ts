import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsAggregatedChargedEnergyComponent } from './cs-aggregated-charged-energy.component';

describe('CsAggregatedChargedEnergyComponent', () => {
  let component: CsAggregatedChargedEnergyComponent;
  let fixture: ComponentFixture<CsAggregatedChargedEnergyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsAggregatedChargedEnergyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsAggregatedChargedEnergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
