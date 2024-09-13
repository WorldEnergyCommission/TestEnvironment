import { vueRouter } from "storybook-vue3-router";

import TSGBrauchwasserComponent from "./TSGBrauchwasser.vue";

export default {
  title: "Devices/Components/Devices/TSGBrauchwasser",
  component: TSGBrauchwasserComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const TSGBrauchwasser = {
  ...Template,
  args: {
    deviceData: {
      name: "TSGBrauchwasser",
      type: "TSGBrauchwasser",
      collection_id: [],
      data: {
        type: "TSGBrauchwasser",
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
          ShowEventDot1_errorWarningState: "errorState",
          ShowEventDot2_errorWarningState: "errorState",
          OutputField1_actualValue: "output1",
          OutputField2_actualValue: "output2",
          OutputField3_actualValue: "output3",
          DropDown1_targetValue: "state",
          DropDown2_targetValue: "state",
          ShowEvent_errorWarningState: "errorState",
        },
      },
    },
  },
};
