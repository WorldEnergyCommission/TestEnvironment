import CoreChip from "./Chip.vue";
import CoreChipGroup from "./ChipGroup.vue";

export default {
  title: "Core/ChipGroup",
  component: CoreChipGroup,
};

const Template = {
  render: (args) => ({
    components: {
      CoreChip,
      CoreChipGroup,
    },
    template: `
    <CoreChipGroup>
      <CoreChip :value=1>
        Chip content 1
      </CoreChip>
      <CoreChip :value=2>
        Chip content 2
      </CoreChip>
  </CoreChipGroup>
    `,
  }),
};

export const ChipGroup = {
  ...Template,
  args: {},
};
