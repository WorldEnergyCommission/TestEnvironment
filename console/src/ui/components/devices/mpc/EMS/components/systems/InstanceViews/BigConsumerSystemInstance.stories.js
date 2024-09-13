import BigConsumerSystemInstanceComponent from "./BigConsumerSystemInstance.vue";

export default {
  title: "Devices/MPC/EMS/systems/InstanceView/BigConsumerSystemInstance",
  component: BigConsumerSystemInstanceComponent,
};

export const BigConsumerSystemInstance = {
  args: {
    systemTypeString: "big_consumer",
    instanceData: {
      power: "actualValue",
      slider_manual: "actualValue",
      state_consumer: "state",
      priority: "actualValue",
      enable_soc: "actualValue",
      disable_soc: "actualValue",
      max_power: "actualValue",
      switch_manual: "state",
      state_manual: "state",
      switch_emergency: "state",
      state_emergency: "state",
      target_power: "actualValue",
      switch_enable: "state",
      state_enable: "state",
      switch_reset: "state",
      state_reset: "state",
      error: "state",
    },
  },
};
