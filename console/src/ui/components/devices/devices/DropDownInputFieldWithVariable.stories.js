import { vueRouter } from "storybook-vue3-router";

import DropDownInputFieldWithVariableComponent from "./DropDownInputFieldWithVariable.vue";

export default {
  title: "Devices/Components/Devices/DropDownInputFieldWithVariable",
  component: DropDownInputFieldWithVariableComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DropDownInputFieldWithVariable = {
  ...Template,
  args: {
    deviceData: {
      name: "DropDownInputFieldWithVariable",
      type: "DropDownInputFieldWithVariable",
      collection_id: [],
      data: {
        type: "DropDownInputFieldWithVariable",
        mappings: {
          DropDown_targetValue: "state",
        },
        meta: {
          cover: "4801551",
          dropDownTexts: {
            DropDown_title: "Drop down",
            DropDown_textmapping: {
              0: "Example Text 1",
              1: "Example Text 2",
              2: "Example Text 3",
              3: "Example Text 4",
              4: "Example Text 5",
            },
          },
        },
      },
    },
  },
};
