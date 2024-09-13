import { vueRouter } from "storybook-vue3-router";

import EMSAdditionalFieldsComponent from "./EMSAdditionalFields.vue";

export default {
  title: "Modals/ManageMLModel/EMSAdditionalFields",
  component: EMSAdditionalFieldsComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const EMSAdditionalFields = {
  ...Template,
  args: {
    modelValue: {
      scaling: {
        pv: 10,
        batteryPower: 13,
        consumption: 9,
      },
    },
  },
};
