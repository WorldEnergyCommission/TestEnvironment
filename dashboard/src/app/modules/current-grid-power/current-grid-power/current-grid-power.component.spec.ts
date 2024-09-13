import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrentGridPowerComponent } from './current-grid-power.component';

describe('CurrentGridPowerComponent', () => {
  let component: CurrentGridPowerComponent;
  let fixture: ComponentFixture<CurrentGridPowerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrentGridPowerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentGridPowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
