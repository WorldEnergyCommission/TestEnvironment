import { action } from "@storybook/addon-actions";

import PlayPauseIconAndTextButtonComponent from "./PlayPauseIconAndTextButton.vue";

export default {
  title: "Devices/Components/Devices/Base/Push Button Types/PlayPauseIconAndTextButton",
  component: PlayPauseIconAndTextButtonComponent,
};

const Template = {
  render: (args) => ({
    components: { PlayPauseIconAndTextButtonComponent },
    methods: { action },
    template: `
    <PlayPauseIconAndTextButtonComponent  
      @playPauseUp="action('playPauseUp')()">
      <template #buttonText>
        Button text
      </template>
    </PlayPauseIconAndTextButtonComponent>
    `,
  }),
};

export const Pause = {
  ...Template,
  args: {
    currentState: 0,
  },
};

export const Play = {
  ...Template,
  args: {
    currentState: 2,
  },
};
