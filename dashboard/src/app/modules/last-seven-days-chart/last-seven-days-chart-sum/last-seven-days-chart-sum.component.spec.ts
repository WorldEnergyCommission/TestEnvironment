import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastSevenDaysChartSumComponent } from './last-seven-days-chart-sum.component';

describe('LastSevenDaysChartSumComponent', () => {
  let component: LastSevenDaysChartSumComponent;
  let fixture: ComponentFixture<LastSevenDaysChartSumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LastSevenDaysChartSumComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LastSevenDaysChartSumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
