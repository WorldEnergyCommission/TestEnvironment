import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PvAggregatedCurrentPowerSymbolicComponent } from './pv-aggregated-current-power-symbolic.component';

describe('PvAggregatedCurrentPowerSymbolicComponent', () => {
  let component: PvAggregatedCurrentPowerSymbolicComponent;
  let fixture: ComponentFixture<PvAggregatedCurrentPowerSymbolicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PvAggregatedCurrentPowerSymbolicComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PvAggregatedCurrentPowerSymbolicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
