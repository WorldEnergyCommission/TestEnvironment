import CreateModuleStepperComponent from "./CreateModuleStepper.vue";

export default {
  title: "Forms/Modules/CreateModuleStepper",
  component: CreateModuleStepperComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.eneries.com/v1/modules/types/list",
        method: "GET",
        status: 200,
        response: ["Item 1", "Item 2"],
      },
    ],
  },
};

export const CreateModuleStepper = {
  args: {},
};
