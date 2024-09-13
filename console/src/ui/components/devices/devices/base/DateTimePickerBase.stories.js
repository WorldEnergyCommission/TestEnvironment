import DateTimePickerBaseComponent from "./DateTimePickerBase.vue";

export default {
  title: "Devices/Components/Devices/Base/DateTimePickerBase",
  component: DateTimePickerBaseComponent,
};

export const DateTimePickerBase = {
  args: {
    variableData: {
      DateTimePicker_actualValue: "date",
    },
    instance: "DateTimePicker",
  },
};
