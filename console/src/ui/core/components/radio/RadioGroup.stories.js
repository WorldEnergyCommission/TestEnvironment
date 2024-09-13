import CoreRadio from "./Radio.vue";
import CoreRadioGroup from "./RadioGroup.vue";

export default {
  title: "Core/RadioGroup",
  component: CoreRadioGroup,
};

const Template = {
  render: (args) => ({
    components: {
      CoreRadio,
      CoreRadioGroup,
    },
    template: `
    <CoreRadioGroup>
      <CoreRadio :value=1 label="Radio content 1" />
      <CoreRadio :value=2 >
        <template #label>
          Radio content 2
        </template>
      </CoreRadio>
  </CoreRadioGroup>
    `,
  }),
};

export const RadioGroup = {
  ...Template,
  args: {},
};
