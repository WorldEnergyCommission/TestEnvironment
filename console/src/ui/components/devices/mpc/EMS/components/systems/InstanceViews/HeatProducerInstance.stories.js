import HeatProducerInstanceComponent from "./HeatProducerInstance.vue";

export default {
  title: "Devices/MPC/EMS/systems/InstanceView/HeatProducerInstance",
  component: HeatProducerInstanceComponent,
};

export const HeatProducerInstance = {
  args: {
    systemTypeString: "heatProducer",
    instanceData: {
      power: "actualValue",
      target_power: "actualValue",
      switch_enable: "state",
      state_enable: "state",
      switch_reset: "state",
      state_reset: "state",
      error: "state",
    },
  },
};
