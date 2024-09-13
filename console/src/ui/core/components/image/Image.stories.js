import CoreImage from "./Image.vue";

export default {
  title: "Core/Image",
  component: CoreImage,
};

export const Image = {
  args: {
    width: 11,
    src: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  },
};
