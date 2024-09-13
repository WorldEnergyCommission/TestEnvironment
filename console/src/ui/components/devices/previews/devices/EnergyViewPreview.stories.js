import { vueRouter } from "storybook-vue3-router";

import EnergyViewPreviewComponent from "./EnergyViewPreview.vue";

export default {
  title: "Devices/Components/Devices/Preview/Devices/EnergyViewPreview",
  component: EnergyViewPreviewComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const EnergyViewPreview = {
  ...Template,
  args: {},
};
