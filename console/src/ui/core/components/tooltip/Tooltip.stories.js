import CoreTooltip from "./Tooltip.vue";

export default {
  title: "Core/Tooltip",
  component: CoreTooltip,
};

export const Tooltip = {
  args: {
    activator: "Tooltip",
    default: "Tooltip content",
    location: "bottom",
  },
};
