import HybridWaterControlsComponent from "./HybridWaterControls.vue";

export default {
  title: "Devices/MPC/SetpointOptimizer/system/SystemInstanceControls/HybridWaterControls",
  component: HybridWaterControlsComponent,
};

export const HybridWaterControls = {
  args: {
    mpcId: "mpc",
    controls: {
      room_temperatures: [
        {
          title: "room",
          variable: "actualValue",
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
      flow_temperature: "output1",
      return_temperature: "output2",
      status: "state",
    },
  },
};
