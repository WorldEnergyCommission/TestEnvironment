import InputFieldExternalComponent from "./InputFieldExternal.vue";

export default {
  title: "Devices/Components/InputFieldExternal",
  component: InputFieldExternalComponent,
};

const Template = {
  render: (args, { updateArgs }) => ({
    components: {
      InputFieldExternalComponent,
    },
    setup() {
      return { ...args };
    },
    template: `
    <InputFieldExternalComponent v-model="modelValue" @update:modelValue="onUpdate($event)" >
      <template #textDescription>
        Text description
      </template>
      <template #unit>
        kWh
      </template>
      <template #icon>
        <lynus-icon class="icon" name="time" size="20" />
      </template>
    </InputFieldExternalComponent>
    `,
    methods: {
      onUpdate(modelValue) {
        updateArgs({ ...args, modelValue });
      },
    },
  }),
};

export const InputFieldExternal = {
  ...Template,
  args: {
    height: 24,
    max: 23,
    min: 0,
    step: 1,
    isDecimal: false,
  },
};
