import SystemInstanceComponent from "./SystemInstance.vue";
import colors from "@/ui/components/devices/mpc/colors";

export default {
  title: "Devices/MPC/SetpointOptimizer/system/components/SystemInstance",
  component: SystemInstanceComponent,
};

export const SystemInstance = {
  args: {
    mpcId: "mpc",
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
    systemInstanceId: "hybrid_air_systems1",
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
