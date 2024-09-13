import DateTimePickerComponent from "./DateTimePicker.vue";

export default {
  title: "Components/DateTimePicker",
  component: DateTimePickerComponent,
};

const Template = {
  render: (args, { updateArgs }) => ({
    components: {
      DateTimePickerComponent,
    },
    setup() {
      return { ...args };
    },
    template: `
    <DateTimePickerComponent v-model="modelValue" @update:modelValue="onUpdate($event)" />
    `,
    methods: {
      onUpdate(modelValue) {
        updateArgs({ ...args, modelValue });
      },
    },
  }),
};

export const WithoutActivator = {
  ...Template,
  args: {},
};

export const WithActivator = {
  args: {
    activator: "Dialog activator",
  },
};
