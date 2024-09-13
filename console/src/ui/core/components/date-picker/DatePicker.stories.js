import CoreDatePicker from "./DatePicker.vue";

export default {
  title: "Core/DatePicker",
  component: CoreDatePicker,
};

const Template = {
  render: (args, { updateArgs }) => ({
    components: {
      CoreDatePicker,
    },
    setup() {
      return { ...args };
    },
    template: `
    <CoreDatePicker v-model="modelValue" @update:modelValue="onUpdate($event)" />
    `,
    methods: {
      onUpdate(modelValue) {
        updateArgs({ ...args, modelValue });
      },
    },
  }),
};

export const DatePicker = {
  ...Template,
  args: {},
};
