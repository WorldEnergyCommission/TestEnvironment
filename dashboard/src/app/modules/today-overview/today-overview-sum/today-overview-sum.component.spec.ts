import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayOverviewSumComponent } from './today-overview-sum.component';

describe('TodayOverviewSumComponent', () => {
  let component: TodayOverviewSumComponent;
  let fixture: ComponentFixture<TodayOverviewSumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TodayOverviewSumComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TodayOverviewSumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
