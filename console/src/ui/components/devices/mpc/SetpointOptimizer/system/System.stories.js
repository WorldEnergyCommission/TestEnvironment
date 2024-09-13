import SystemComponent from "./index.vue";
import colors from "@/ui/components/devices/mpc/colors";
import forecastMockData from "@/ui/components/devices/previews/mpc/SetpointOptimizer/forecastMockData";

export default {
  title: "Devices/MPC/SetpointOptimizer/system/System",
  component: SystemComponent,
};

export const System = {
  args: {
    forecastData: forecastMockData,
    mpcId: "mpc",
    systemCount: 1,
    systemInstanceType: "hybrid_air_systems",
    systemData: {
      heating_air_systems1: {
        room_temperatures: [
          {
            title: "room",
            variable: "variable",
          },
        ],
      },
    },
    lineData: {
      key: "heating_water_systems",
      x: 694,
      y: 105,
      w: 100,
      h: 100,
    },
    lineReady: false,
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
