import { vueRouter } from "storybook-vue3-router";

import ScalingFieldComponent from "./ScalingField.vue";

export default {
  title: "Modals/Components/Form/ScalingField",
  component: ScalingFieldComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ScalingField = {
  ...Template,
  args: {
    modelValue: {
      min: 0,
      max: 100,
    },
  },
};
