import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsAggregatedCurrentConnectedCarsComponent } from './cs-aggregated-current-connected-cars.component';

describe('CsAggregatedCurrentConnectedCarsComponent', () => {
  let component: CsAggregatedCurrentConnectedCarsComponent;
  let fixture: ComponentFixture<CsAggregatedCurrentConnectedCarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsAggregatedCurrentConnectedCarsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsAggregatedCurrentConnectedCarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
