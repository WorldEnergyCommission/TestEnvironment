import { vueRouter } from "storybook-vue3-router";

import RangeDatePickerComponent from "./RangeDatePicker.vue";

export default {
  title: "Modals/Components/RangeDatePicker",
  component: RangeDatePickerComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const RangeDatePicker = {
  ...Template,
  args: {
    startDate: 1711618979,
    endDate: 1711618979,
  },
};
