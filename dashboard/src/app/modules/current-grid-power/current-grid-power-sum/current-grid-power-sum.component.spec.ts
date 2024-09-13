import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentGridPowerSumComponent } from './current-grid-power-sum.component';

describe('CurrentGridPowerSumComponent', () => {
  let component: CurrentGridPowerSumComponent;
  let fixture: ComponentFixture<CurrentGridPowerSumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrentGridPowerSumComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentGridPowerSumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
