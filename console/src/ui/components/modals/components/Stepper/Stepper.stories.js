import { vueRouter } from "storybook-vue3-router";

import StepComponent from "./Step.vue";
import StepperComponent from "./Stepper.vue";
import StepperWindowComponent from "./StepperWindow.vue";

export default {
  title: "Modals/Components/Stepper/Stepper",
  component: StepperComponent,
};

const Template = {
  decorators: [vueRouter()],
  render: (args, { updateArgs }) => ({
    components: { StepComponent, StepperComponent, StepperWindowComponent },
    setup() {
      return { ...args };
    },
    template: `
    <StepperComponent v-model="modelValue">
      <StepperWindowComponent v-model="modelValue">
        <StepComponent :step="1">
          <template #content>
            Content
          </template>
          <template #footer>
            Footer
          </template>
        </StepComponent>
      </StepperWindowComponent>
    </StepperComponent>
    `,
    methods: {
      onUpdate(modelValue) {
        updateArgs({ ...args, modelValue });
      },
    },
  }),
};

export const Stepper = {
  ...Template,
  args: {
    modelValue: 1,
  },
};
