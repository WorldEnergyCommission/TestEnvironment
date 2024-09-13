import { vueRouter } from "storybook-vue3-router";

import DropDownOutputFieldWithVariableComponent from "./DropDownOutputFieldWithVariable.vue";

export default {
  title: "Devices/Components/Devices/DropDownOutputFieldWithVariable",
  component: DropDownOutputFieldWithVariableComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DropDownOutputFieldWithVariable = {
  ...Template,
  args: {
    deviceData: {
      name: "DropDownOutputFieldWithVariable",
      type: "DropDownOutputFieldWithVariable",
      collection_id: [],
      data: {
        type: "DropDownOutputFieldWithVariable",
        mappings: {
          DropDown_targetValue: "state",
        },
        meta: {
          cover: "4801530",
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
