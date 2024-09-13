import DataMappingSelectFieldComponent from "./DataMappingSelectField.vue";

export default {
  title: "Forms/Modules/DataMappingSelectField",
  component: DataMappingSelectFieldComponent,
};

const Template = {
  render: (args, { updateArgs }) => ({
    components: {
      DataMappingSelectFieldComponent,
    },
    setup() {
      return { ...args };
    },
    template: `
    <DataMappingSelectFieldComponent :modelValue="modelValue" @update:modelValue="onUpdate($event)" />
    `,
    methods: {
      onUpdate(modelValue) {
        updateArgs({ ...args, modelValue });
      },
    },
  }),
};

export const DataMappingSelectField = {
  ...Template,
  args: {
    typeId: "typeId",
    label: "Label",
    optional: "true",
    maxCount: 1,
    disabled: false,
  },
};
