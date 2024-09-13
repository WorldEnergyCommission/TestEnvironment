import SystemInstanceForecastComponent from "./SystemInstanceForecast.vue";
import colors from "@/ui/components/devices/mpc/colors";

export default {
  title: "Devices/MPC/SetpointOptimizer/system/components/SystemInstanceForecast",
  component: SystemInstanceForecastComponent,
};

export const SystemInstanceForecast = {
  args: {
    actualValue: [0, 1],
    systemInstanceType: "hybrid_air_systems",
    systemInstanceData: {
      room_temperatures: [
        {
          title: "room",
          variable: "variable",
        },
      ],
      max_flow_temperature: {
        heating: 30,
        cooling: 30,
      },
      min_flow_temperature: {
        heating: 18,
        cooling: 18,
      },
      set_point_temperature: {
        heating: 23,
        cooling: 23,
      },
    },
    instanceLineData: {
      key: "hybrid_air_systems",
      x: 694,
      y: 105,
      w: 100,
      h: 100,
    },
    systemColors: {
      rotatingBacklightColor: {
        main: colors.red,
        reversed: colors.red,
      },
      animatedLine: {
        main: colors.red,
        reversed: colors.red,
      },
    },
  },
};
