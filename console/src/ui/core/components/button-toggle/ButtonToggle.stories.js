import CoreButtonToggle from "./ButtonToggle.vue";
import CoreButton from "../button/Button.vue";

export default {
  title: "Core/ButtonToggle",
  component: CoreButtonToggle,
};

const Template = {
  render: (args) => ({
    components: {
      CoreButtonToggle,
      CoreButton,
    },
    template: `
    <CoreButtonToggle>
      <CoreButton buttonType="primary">
        Button 1
      </CoreButton>
      <CoreButton buttonType="primary">
        Button 2
      </CoreButton>
    </CoreButtonToggle>
    `,
  }),
};

export const ButtonToggle = {
  ...Template,
  args: {},
};
