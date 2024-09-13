import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentValueComponent } from './current-value.component';

describe('CurrentValueComponent', () => {
  let component: CurrentValueComponent;
  let fixture: ComponentFixture<CurrentValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrentValueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
