import LabelUnitWrapperComponent from "./LabelUnitWrapper.vue";
import CoreButton from "@/ui/core/components/button/Button.vue";

export default {
  title: "Devices/Components/LabelUnitWrapper",
  component: LabelUnitWrapperComponent,
};

const Template = {
  render: (args) => ({
    components: {
      LabelUnitWrapperComponent,
      CoreButton,
    },
    template: `
    <LabelUnitWrapperComponent>
      <template #label>
        Label
      </template>
      <template #value>
        <CoreButton>Value</CoreButton>
      </template>
    </LabelUnitWrapperComponent>
    `,
  }),
};

export const LabelUnitWrapper = {
  ...Template,
  args: {
    disabled: true,
  },
};
