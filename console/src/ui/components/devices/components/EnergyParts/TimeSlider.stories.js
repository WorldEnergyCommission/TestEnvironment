import TimeSliderComponent from "./TimeSlider.vue";

export default {
  title: "Devices/Components/Energy Parts/TimeSlider",
  component: TimeSliderComponent,
};

const Template = {
  render: (args, { updateArgs }) => ({
    components: {
      TimeSliderComponent,
    },
    setup() {
      return { ...args };
    },
    template: `
    <TimeSliderComponent v-model="modelValue" @update:modelValue="onUpdate($event)" />
    `,
    methods: {
      onUpdate(modelValue) {
        updateArgs({ ...args, modelValue });
      },
    },
  }),
};

export const TimeSlider = {
  ...Template,
  args: {
    items: [[1709161200], [1709190000], [1709204400], [1709218800], [1709233200], [1709247600]],
  },
};
