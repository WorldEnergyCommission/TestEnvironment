import PreviewImageComponent from "./PreviewImage.vue";

export default {
  title: "Components/PreviewImage",
  component: PreviewImageComponent,
};

export const PreviewImage = {
  args: {
    src: "/assets/images/weather/waterdrop.png",
    maxWidth: 20,
    maxHeight: 20,
  },
};
