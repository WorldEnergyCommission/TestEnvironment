import DeviceCardWrapperComponent from "./DeviceCardWrapper.vue";

export default {
  title: "Devices/Layout/DeviceCardWrapper",
  component: DeviceCardWrapperComponent,
};

export const DeviceCardWrapper = {
  args: {
    title: "Title",
    default: "Content",
  },
};
