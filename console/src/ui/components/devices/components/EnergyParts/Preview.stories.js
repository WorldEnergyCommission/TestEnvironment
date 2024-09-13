import PreviewComponent from "./Preview.vue";

export default {
  title: "Devices/Components/Energy Parts/Preview",
  component: PreviewComponent,
};

export const Default = {
  args: {},
};

export const WithArgs = {
  args: {
    previewTitle: "Title",
    systemCount: 2,
    overlay: true,
    errorWarningLocal: 2,
    previewTitlePosition: "bottom",
  },
};
