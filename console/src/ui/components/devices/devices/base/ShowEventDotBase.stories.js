import ShowEventDotBaseComponent from "./ShowEventDotBase.vue";

export default {
  title: "Devices/Components/Devices/Base/ShowEventDotBase",
  component: ShowEventDotBaseComponent,
};

export const Active = {
  args: {
    variableData: {
      ShowEventDotBase_errorWarningState: "errorStatus",
    },
    instance: "ShowEventDotBase",
    items: [[1, "red"]],
    activeMessage: "Active message",
  },
};

export const Inactive = {
  args: {
    variableData: {
      ShowEventDotBase_errorWarningState: "",
    },
    instance: "ShowEventDotBase",
    inactiveMessage: "Inactive message",
  },
};
