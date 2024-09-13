import BatteryBaseComponent from "./BatteryBase.vue";

export default {
  title: "Devices/Components/Devices/Base/BatteryBase",
  component: BatteryBaseComponent,
};

const Template = {
  render: (args) => ({
    components: {
      BatteryBaseComponent,
    },
    template: `
    <BatteryBaseComponent style="width: 200px; height: 50px"/>
    `,
  }),
};

export const BatteryBase = {
  ...Template,
  args: {
    variableData: {
      Battery_actualValue: "actualValue",
    },
    instance: "Battery",
    min: 0,
    max: 100,
    unit: "kWh",
  },
};
