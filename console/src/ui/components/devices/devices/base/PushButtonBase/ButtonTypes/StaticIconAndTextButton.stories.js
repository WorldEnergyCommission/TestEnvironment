import { action } from "@storybook/addon-actions";

import StaticIconAndTextButtonComponent from "./StaticIconAndTextButton.vue";

export default {
  title: "Devices/Components/Devices/Base/Push Button Types/StaticIconAndTextButton",
  component: StaticIconAndTextButtonComponent,
};

const Template = {
  render: (args) => ({
    components: { StaticIconAndTextButtonComponent },
    methods: { action },
    template: `
    <StaticIconAndTextButtonComponent 
      @down="action('down')()" 
      @up="action('up')()">
      <template #buttonText>
        Button text
      </template>
    </StaticIconAndTextButtonComponent>
    `,
  }),
};

export const StaticIconAndTextButton = {
  ...Template,
  args: {},
};
