import InputFieldBaseComponent from "./InputFieldBase.vue";

export default {
  title: "Devices/Components/Devices/Base/InputFieldBase",
  component: InputFieldBaseComponent,
};

const Template = {
  render: (args, { updateArgs }) => ({
    components: {
      InputFieldBaseComponent,
    },
    setup() {
      return { ...args };
    },
    template: `
    <InputFieldBaseComponent >
      <template #textDescription>
        Text description
      </template>
      <template #unit>
        kWh
      </template>
      <template #icon>
        <lynus-icon class="icon" name="time" size="20" />
      </template>
    </InputFieldBaseComponent>
    `,
    methods: {
      onUpdate(modelValue) {
        updateArgs({ ...args, modelValue });
      },
    },
  }),
};

export const InputFieldBase = {
  ...Template,
  args: {
    variableData: {
      InputFieldBase_targetValue: "actualValue",
    },
    instance: "InputFieldBase",
    min: 0,
    max: 100,
    step: 10,
    withSpacer: true,
  },
};
