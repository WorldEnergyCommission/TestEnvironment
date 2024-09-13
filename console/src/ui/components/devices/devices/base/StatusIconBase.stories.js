import StatusIconBaseComponent from "./StatusIconBase.vue";

export default {
  title: "Devices/Components/Devices/Base/StatusIconBase",
  component: StatusIconBaseComponent,
};

export const StatusIconBase = {
  args: {
    variableData: {
      StatusIconBase_currentValue: "actualValue",
    },
    instance: "StatusIconBase",
    iconMapping: {
      trash: [0, 100],
    },
  },
};
