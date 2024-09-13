import DeviceDescriptionComponent from "./DeviceDescription.vue";

export default {
  title: "Devices/Actions/DeviceDescription",
  component: DeviceDescriptionComponent,
};

export const DeviceDescription = {
  args: {
    description: {
      title: "Description title",
      overview: "Description overview",
      table: [
        {
          name: "Name",
          description: "Description",
          allowedValues: "Allowed values",
        },
      ],
    },
  },
};
