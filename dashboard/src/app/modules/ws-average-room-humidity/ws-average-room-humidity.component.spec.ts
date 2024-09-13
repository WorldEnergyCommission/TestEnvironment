import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WsAverageRoomHumidityComponent } from './ws-average-room-humidity.component';

describe('WsAverageRoomHumidityComponent', () => {
  let component: WsAverageRoomHumidityComponent;
  let fixture: ComponentFixture<WsAverageRoomHumidityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WsAverageRoomHumidityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WsAverageRoomHumidityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
