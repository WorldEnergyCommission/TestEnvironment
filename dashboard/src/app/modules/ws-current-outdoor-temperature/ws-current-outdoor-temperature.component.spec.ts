import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WsCurrentOutdoorTemperatureComponent } from './ws-current-outdoor-temperature.component';

describe('WsCurrentOutdoorTemperatureComponent', () => {
  let component: WsCurrentOutdoorTemperatureComponent;
  let fixture: ComponentFixture<WsCurrentOutdoorTemperatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WsCurrentOutdoorTemperatureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WsCurrentOutdoorTemperatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
