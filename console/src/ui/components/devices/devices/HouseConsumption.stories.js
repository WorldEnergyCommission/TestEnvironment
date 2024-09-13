import { vueRouter } from "storybook-vue3-router";

import HouseConsumptionComponent from "./HouseConsumption.vue";

export default {
  title: "Devices/Components/Devices/HouseConsumption",
  component: HouseConsumptionComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const HouseConsumption = {
  ...Template,
  args: {
    deviceData: {
      name: "HouseConsumption",
      type: "HouseConsumption",
      collection_id: [],
      data: {
        type: "HouseConsumption",
        mappings: {
          OutputField_actualValue: "output1",
        },
      },
    },
  },
};
