import CoreTab from "./Tab.vue";
import CoreTabs from "./Tabs.vue";

export default {
  title: "Core/Tabs",
  component: CoreTabs,
};

const Template = {
  render: (args, { updateArgs }) => ({
    components: {
      CoreTabs,
      CoreTab,
    },
    setup() {
      return { ...args };
    },
    template: `
    <CoreTabs v-model="modelValue" @update:modelValue="onUpdate($event)">
      <CoreTab :value="1">Tab 1</CoreTab>
      <CoreTab :value="2">Tab 2</CoreTab>
    </CoreTabs>
    `,
    methods: {
      onUpdate(modelValue) {
        updateArgs({ ...args, modelValue });
      },
    },
  }),
};

export const Tabs = {
  ...Template,
  args: {
    modelValue: 1,
  },
};
