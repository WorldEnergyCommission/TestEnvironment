import HeatingWaterControlsComponent from "./HeatingWaterControls.vue";

export default {
  title: "Devices/MPC/SetpointOptimizer/system/SystemInstanceControls/HeatingWaterControls",
  component: HeatingWaterControlsComponent,
};

export const HeatingWaterControls = {
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
