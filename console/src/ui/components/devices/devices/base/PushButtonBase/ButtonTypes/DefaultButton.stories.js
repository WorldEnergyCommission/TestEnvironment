import { action } from "@storybook/addon-actions";

import DefaultButtonComponent from "./DefaultButton.vue";

export default {
  title: "Devices/Components/Devices/Base/Push Button Types/DefaultButton",
  component: DefaultButtonComponent,
};

const Template = {
  render: (args) => ({
    components: { DefaultButtonComponent },
    methods: { action },
    template: `
    <DefaultButtonComponent 
      @down="action('down')()" 
      @up="action('up')()">
      <template #buttonText>
        Button text
      </template>
    </DefaultButtonComponent>
    `,
  }),
};

export const DefaultButton = {
  ...Template,
  args: {},
};
