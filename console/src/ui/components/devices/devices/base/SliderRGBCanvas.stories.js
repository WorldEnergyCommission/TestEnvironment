import SliderRGBCanvasComponent from "./SliderRGBCanvas.vue";

export default {
  title: "Devices/Components/Devices/Base/SliderRGBCanvas",
  component: SliderRGBCanvasComponent,
};

export const SliderRGBCanvas = {
  args: {
    variableData: {
      SliderRGBCanvas_targetValue_blue: "actualValue",
      SliderRGBCanvas_targetValue_green: "actualValue",
      SliderRGBCanvas_targetValue_red: "actualValue",
    },
    instance: "SliderRGBCanvas",
    isActive: true,
  },
};
