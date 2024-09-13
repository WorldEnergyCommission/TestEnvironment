import GeneratorSystemInstanceComponent from "./GeneratorSystemInstance.vue";

export default {
  title: "Devices/MPC/EMS/systems/InstanceView/GeneratorSystemInstance",
  component: GeneratorSystemInstanceComponent,
};

export const GeneratorSystemInstance = {
  args: {
    systemTypeString: "generator",
    instanceData: {
      power: "actualValue",
      state_generator: "state",
      enable_soc: "actualValue",
      disable_soc: "actualValue",
      target_power: "actualValue",
      switch_enable: "state",
      state_enable: "state",
      switch_reset: "state",
      state_reset: "state",
      error: "state",
    },
  },
};
