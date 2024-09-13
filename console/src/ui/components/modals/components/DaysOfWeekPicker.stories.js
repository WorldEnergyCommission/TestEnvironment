import { vueRouter } from "storybook-vue3-router";

import DaysOfWeekPickerComponent from "./DaysOfWeekPicker.vue";

export default {
  title: "Modals/Components/DaysOfWeekPicker",
  component: DaysOfWeekPickerComponent,
};

const Template = {
  decorators: [vueRouter()],
  render: (args, { updateArgs }) => ({
    components: {
      DaysOfWeekPickerComponent,
    },
    setup() {
      return { ...args };
    },
    template: `
    <DaysOfWeekPickerComponent v-model="modelValue" @update:modelValue="onUpdate($event)" />
    `,
    methods: {
      onUpdate(modelValue) {
        updateArgs({ ...args, modelValue });
      },
    },
  }),
};

export const DaysOfWeekPicker = {
  ...Template,
  args: {
    label: "Label",
    modelValue: [false, false, false, false, false, false, false],
  },
};
