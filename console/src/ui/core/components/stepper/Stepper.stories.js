import CoreStepper from "./Stepper.vue";
import CoreStepperHeader from "./StepperHeader.vue";
import CoreStepperHeaderItem from "./StepperHeaderItem.vue";
import CoreStepperWindow from "./StepperWindow.vue";
import CoreStepperWindowItem from "./StepperWindowItem.vue";
import CoreButton from "../button/Button.vue";

export default {
  title: "Core/Stepper",
  component: CoreStepper,
};

const Template = {
  render: (args, { updateArgs }) => ({
    components: {
      CoreStepper,
      CoreStepperHeader,
      CoreStepperHeaderItem,
      CoreStepperWindow,
      CoreStepperWindowItem,
      CoreButton,
    },
    setup() {
      return { ...args };
    },
    template: `
    <CoreStepper v-model="modelValue">
    <CoreStepperHeader>
      <CoreStepperHeaderItem :complete="stepper > 1" :value="1"></CoreStepperHeaderItem>
      <CoreStepperHeaderItem :complete="stepper > 2" :value="2"></CoreStepperHeaderItem>
      <CoreStepperHeaderItem :value="3"></CoreStepperHeaderItem>
    </CoreStepperHeader>
    <CoreStepperWindow>
      <CoreStepperWindowItem :value="1">
        <div>Window 1</div>
        <CoreButton @click="onClick(2)">Next</CoreButton>
      </CoreStepperWindowItem>
      <CoreStepperWindowItem :value="2">
      <div>Window 2</div>
        <CoreButton @click="onClick(1)">Back</CoreButton>
        <CoreButton @click="onClick(3)">Next</CoreButton>
      </CoreStepperWindowItem>
      <CoreStepperWindowItem :value="3">
      <div>Window 3</div>
        <CoreButton @click="onClick(2)">Back</CoreButton>
      </CoreStepperWindowItem>
    </CoreStepperWindow>
  </CoreStepper>
    `,
    methods: {
      onClick(modelValue) {
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
