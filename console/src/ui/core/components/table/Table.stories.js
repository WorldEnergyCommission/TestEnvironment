import CoreTable from "./Table.vue";

export default {
  title: "Core/Table",
  component: CoreTable,
};

export const Table = {
  args: {
    default: "Table content",
    dense: true,
  },
};
