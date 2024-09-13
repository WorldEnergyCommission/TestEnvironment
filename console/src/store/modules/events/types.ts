export enum EventType {
  Warning = 1,
  Error = 2,
  Info = 0,
}

export interface IEvent {
  id: string;
  body: string;
  type: EventType;
  accepted_by?: string;
  accepted?: string;
  created_at: string;
  project_id?: string;
}

export interface IEventState {
  eventList: IEvent[];
  eventListFilter: string;
}
