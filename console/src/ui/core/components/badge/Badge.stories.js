import CoreBadge from "./Badge.vue";

export default {
  title: "Core/Badge",
  component: CoreBadge,
};

export const Badge = {
  args: {
    modelValue: true,
    default: "Badge",
    floating: true,
    color: "accent",
    dot: true,
  },
};
