import { action } from "@storybook/addon-actions";

import UpDownRoundedOnlyIconButtonComponent from "./UpDownRoundedOnlyIconButton.vue";

export default {
  title: "Devices/Components/Devices/Base/Push Button Types/UpDownRoundedOnlyIconButton",
  component: UpDownRoundedOnlyIconButtonComponent,
};

const Template = {
  render: (args) => ({
    components: { UpDownRoundedOnlyIconButtonComponent },
    methods: { action },
    template: `
    <UpDownRoundedOnlyIconButtonComponent 
      @down="action('down')()" 
      @up="action('up')()" />
    `,
  }),
};

export const UpDownRoundedOnlyIconButton = {
  ...Template,
  args: {},
};
