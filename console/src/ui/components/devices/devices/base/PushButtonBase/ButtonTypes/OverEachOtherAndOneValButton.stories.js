import { action } from "@storybook/addon-actions";

import OverEachOtherAndOneValButtonComponent from "./OverEachOtherAndOneValButton.vue";

export default {
  title: "Devices/Components/Devices/Base/Push Button Types/OverEachOtherAndOneValButton",
  component: OverEachOtherAndOneValButtonComponent,
};

const Template = {
  render: (args) => ({
    components: { OverEachOtherAndOneValButtonComponent },
    methods: { action },
    template: `
    <OverEachOtherAndOneValButtonComponent  
      @sendSingleValue="action('sendSingleValue')()">
      <template #buttonText>
        Button text
      </template>
    </OverEachOtherAndOneValButtonComponent>
    `,
  }),
};

export const OverEachOtherAndOneValButton = {
  ...Template,
  args: {},
};
