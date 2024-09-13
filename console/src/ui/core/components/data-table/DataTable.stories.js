import CoreDataTable from "./DataTable.vue";

export default {
  title: "Core/DataTable",
  component: CoreDataTable,
};

export const DataTable = {
  args: {
    default: "DataTable content",
    headers: [
      { title: "Name", value: "name" },
      { title: "Id", value: "id" },
    ],
    items: [
      { name: "1 year", id: "1y" },
      { name: "1 month", id: "1month" },
      { name: "1 week", id: "1w" },
      { name: "1 day", id: "1d" },
      { name: "1 hour", id: "1h" },
    ],
  },
};
