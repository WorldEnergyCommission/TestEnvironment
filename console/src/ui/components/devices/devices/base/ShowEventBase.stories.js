import ShowEventBaseComponent from "./ShowEventBase.vue";

export default {
  title: "Devices/Components/Devices/Base/ShowEventBase",
  component: ShowEventBaseComponent,
};

export const ShowEventBase = {
  args: {
    variableData: {
      ShowEventBase_errorWarningState: "state",
    },
    instance: "ShowEventBase",
    warningState: 1,
  },
};
