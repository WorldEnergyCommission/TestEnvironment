import CoreSwitch from "./CoreSwitch.vue";

export default {
  title: "Core/Switch",
  component: CoreSwitch,
};

const Template = {
  render: (args, { updateArgs }) => ({
    components: {
      CoreSwitch,
    },
    setup() {
      return { ...args };
    },
    template: `
    <CoreSwitch v-model="modelValue" @update:modelValue="onUpdate($event)" />
    `,
    methods: {
      onUpdate(modelValue) {
        updateArgs({ ...args, modelValue });
      },
    },
  }),
};

export const Switch = {
  ...Template,
  args: {
    label: "Label",
    modelValue: true,
  },
};
