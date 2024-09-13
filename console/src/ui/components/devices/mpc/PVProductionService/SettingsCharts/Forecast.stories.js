import ForecastComponent from "./Forecast.vue";

export default {
  title: "Devices/MPC/PVProductionService/Forecast",
  component: ForecastComponent,
};

export const Forecast = {
  args: {
    chartsScaling: 20,
    mpcId: "mpc",
  },
};
