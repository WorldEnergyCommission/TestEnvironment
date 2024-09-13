import { vueRouter } from "storybook-vue3-router";

import ManageStepperHeaderComponent from "./ManageStepperHeader.vue";
import CoreStepper from "@/ui/core/components/stepper/Stepper.vue";

export default {
  title: "Modals/Components/ManageStepperHeader",
  component: ManageStepperHeaderComponent,
};

const Template = {
  decorators: [vueRouter()],
  render: (args) => ({
    components: { ManageStepperHeaderComponent, CoreStepper },
    template: `
    <CoreStepper>
      <ManageStepperHeaderComponent />
    </CoreStepper>
    `,
  }),
};

export const ManageStepperHeader = {
  ...Template,
  args: {
    stage: 1,
    translationSubPath: "manageDevice",
  },
};
