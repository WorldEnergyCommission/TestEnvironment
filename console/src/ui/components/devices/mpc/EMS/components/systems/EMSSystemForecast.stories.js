import EMSSystemForecastComponent from "./EMSSystemForecast.vue";

export default {
  title: "Devices/MPC/EMS/systems/EMSSystemForecast",
  component: EMSSystemForecastComponent,
};

export const EMSSystemForecast = {
  args: {
    instanceViewLabel: "Label",
    systemProps: {
      systemTypeString: "pv",
      systemData: {
        pv1: {
          power: "actualValue",
        },
        pv2: {
          power: "actualValue",
        },
      },
    },
    systemForcastProps: {
      groupSliderState: 50,
    },
  },
};
