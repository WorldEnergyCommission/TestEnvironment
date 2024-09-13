import ForecastViewComponent from "./ForecastView.vue";
import colors from "@/ui/components/devices/mpc/colors";
import forecastMockData from "@/ui/components/devices/previews/mpc/SetpointOptimizer/forecastMockData";

export default {
  title: "Devices/MPC/SetpointOptimizer/system/components/ForecastView",
  component: ForecastViewComponent,
};

export const ForecastView = {
  args: {
    forecastData: forecastMockData,
    mpcId: "mpc",
    systemCount: 1,
    systemInstanceType: "hybrid_air_systems",
    systemData: {
      hybrid_air_systems1: {
        room_temperatures: [
          {
            title: "room",
            variable: "variable",
          },
        ],
      },
    },
    lineData: {
      key: "hybrid_air_systems",
      x: 694,
      y: 105,
      w: 100,
      h: 100,
    },
    lineReady: true,
    canvasCenter: { x: 462, y: 325, w: 120, h: 120 },
    canvasSize: { width: 925, height: 650 },
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
