import StatusIndicatorComponent from "./StatusIndicator.vue";

export default {
  title: "Components/StatusIndicator",
  component: StatusIndicatorComponent,
};

export const Online = {
  args: {
    status: true,
  },
};

export const Offline = {
  args: {
    status: false,
  },
};

export const Unknown = {
  args: {
    status: null,
  },
};
