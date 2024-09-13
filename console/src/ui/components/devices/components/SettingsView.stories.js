import { action } from "@storybook/addon-actions";

import SettingsViewComponent from "./SettingsView.vue";

export default {
  title: "Devices/Components/SettingsView",
  component: SettingsViewComponent,
};

const Template = {
  render: (args) => ({
    components: { SettingsViewComponent },
    methods: { action },
    template: `
    <SettingsViewComponent 
      @switchSettingsView="action('switchSettingsView')()">
      <template #content>
        Settings view content
      </template>
    </SettingsViewComponent>
    `,
  }),
};

export const SettingsView = {
  ...Template,
  args: {
    modelValue: true,
    content: "Settings view content",
    deviceData: {
      name: "LightSwitch",
      type: "LightSwitch",
    },
  },
};
