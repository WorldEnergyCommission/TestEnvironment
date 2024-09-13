import CoreAutocomplete from "./Autocomplete.vue";

export default {
  title: "Core/Autocomplete",
  component: CoreAutocomplete,
};

export const Autocomplete = {
  args: {
    items: [
      { name: "1 year", id: "1y" },
      { name: "1 month", id: "1month" },
      { name: "1 week", id: "1w" },
      { name: "1 day", id: "1d" },
      { name: "1 hour", id: "1h" },
    ],
    label: "Label",
    itemValue: "id",
    itemTitle: "name",
  },
};
