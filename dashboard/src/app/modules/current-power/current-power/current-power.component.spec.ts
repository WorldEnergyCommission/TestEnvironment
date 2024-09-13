import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrentPowerComponent } from './current-power.component';

describe('CurrentPowerComponent', () => {
  let component: CurrentPowerComponent;
  let fixture: ComponentFixture<CurrentPowerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrentPowerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentPowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
