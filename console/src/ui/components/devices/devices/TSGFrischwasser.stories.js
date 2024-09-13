import { vueRouter } from "storybook-vue3-router";

import TSGFrischwasserComponent from "./TSGFrischwasser.vue";

export default {
  title: "Devices/Components/Devices/TSGFrischwasser",
  component: TSGFrischwasserComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const TSGFrischwasser = {
  ...Template,
  args: {
    deviceData: {
      name: "TSGFrischwasser",
      type: "TSGFrischwasser",
      collection_id: [],
      data: {
        type: "TSGFrischwasser",
        mappings: {
          InputField1_targetValue: "input",
          InputField2_targetValue: "input",
          InputField3_targetValue: "input",
          PushButton1_onOff: "state",
          PushButton1_state: "state",
          PushButton2_onOff: "state",
          PushButton2_state: "state",
          InputField4_targetValue: "input",
          InputField5_targetValue: "input",
          InputField6_targetValue: "input",
          InputField7_targetValue: "input",
          InputField8_targetValue: "input",
          InputField9_targetValue: "input",
          InputField10_targetValue: "input",
          InputField11_targetValue: "input",
          InputField12_targetValue: "input",
          InputField13_targetValue: "input",
          InputField14_targetValue: "input",
          ShowEventDot1_errorWarningState: "errorState",
          ShowEventDot2_errorWarningState: "errorState",
          OutputField1_actualValue: "output1",
          OutputField2_actualValue: "output2",
          OutputField3_actualValue: "output3",
          OutputField4_actualValue: "output4",
          OutputField5_actualValue: "output1",
          DropDown1_targetValue: "state",
          DropDown2_targetValue: "state",
          ShowEvent_errorWarningState: "errorState",
        },
      },
    },
  },
};
