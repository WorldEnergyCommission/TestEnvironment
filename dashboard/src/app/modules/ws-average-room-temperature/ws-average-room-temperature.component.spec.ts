import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WsAverageRoomTemperatureComponent } from './ws-average-room-temperature.component';

describe('aktuelleInnenraumtemperaturComponent', () => {
  let component: WsAverageRoomTemperatureComponent;
  let fixture: ComponentFixture<WsAverageRoomTemperatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WsAverageRoomTemperatureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WsAverageRoomTemperatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
