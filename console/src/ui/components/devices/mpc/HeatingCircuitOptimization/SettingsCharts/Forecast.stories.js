import ForecastComponent from "./Forecast.vue";

export default {
  title: "Devices/MPC/HeatingCircuitOptimization/Forecast",
  component: ForecastComponent,
};

export const Forecast = {
  args: {
    isPreview: true,
    deviceId: "id",
  },
};
