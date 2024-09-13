import ReportFieldComponent from "./ReportField.vue";

export default {
  title: "Devices/Modules/ReportField",
  component: ReportFieldComponent,
};

export const ReportField = {
  args: {
    icon: "trash",
    title: "title",
    number: 2,
    iconColor: "accent",
    unit: "kWh",
    animate: false,
  },
};
