import SelectModuleComponent from "./SelectModule.vue";

export default {
  title: "Forms/Modules/SelectModule",
  component: SelectModuleComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.efficientio.io/v1/modules/types/list",
        method: "GET",
        status: 200,
        response: ["Item 1", "Item 2"],
      },
    ],
  },
};

const Template = {
  render: (args, { updateArgs }) => ({
    components: {
      SelectModuleComponent,
    },
    setup() {
      return { ...args };
    },
    template: `
    <SelectModuleComponent :modelValue="modelValue" @update:modelValue="onUpdate($event)" />
    `,
    methods: {
      onUpdate(modelValue) {
        updateArgs({ ...args, modelValue });
      },
    },
  }),
};

export const SelectModule = {
  ...Template,
  args: {},
};
