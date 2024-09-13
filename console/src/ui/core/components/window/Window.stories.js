import CoreWindow from "./Window.vue";
import CoreWindowItem from "./WindowItem.vue";
import CoreTab from "../tabs/Tab.vue";
import CoreTabs from "../tabs/Tabs.vue";

export default {
  title: "Core/Window",
  component: CoreWindow,
};

const Template = {
  render: (args, { updateArgs }) => ({
    components: {
      CoreTabs,
      CoreTab,
      CoreWindow,
      CoreWindowItem,
    },
    setup() {
      return { ...args };
    },
    template: `
    <CoreTabs v-model="modelValue" @update:modelValue="onUpdate($event)">
      <CoreTab :value="1">Tab 1</CoreTab>
      <CoreTab :value="2">Tab 2</CoreTab>
    </CoreTabs>
    <CoreWindow v-model="modelValue">
      <CoreWindowItem :value="1">Window 1</CoreWindowItem>
      <CoreWindowItem :value="2">Window 2</CoreWindowItem>
    </CoreWindow>
    `,
    methods: {
      onUpdate(modelValue) {
        updateArgs({ ...args, modelValue });
      },
    },
  }),
};

export const Window = {
  ...Template,
  args: {},
};
