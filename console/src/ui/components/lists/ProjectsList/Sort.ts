export enum SortByKey {
  name = "name",
  createdAt = "created_at",
  last_connection = "last_connection",
  number_of_devices = "number_of_devices",
}

export enum SortByOrder {
  desc = "desc",
  asc = "asc",
}

export interface SortBy {
  key: SortByKey;
  order: SortByOrder;
}
