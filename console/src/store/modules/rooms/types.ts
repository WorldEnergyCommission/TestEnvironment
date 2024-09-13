import { Map } from "immutable";

export interface IRoomsState {
  rooms: Map<string, IRoom>;
  currentRoomId: string;
}

export interface IRoom {
  id: string;
  name: string;
  meta: any;
  created_at: string;
}

export interface IPositionedRoom {
  room: IRoom;
  x: number;
  y: number;
}

export interface IRoomDndLayout extends IPositionedRoom {
  w: number;
  h: number;
  i: number | string;
}
