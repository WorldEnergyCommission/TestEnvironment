import BatteryLevelComponent from "./BatteryLevel.vue";

export default {
  title: "Devices/Components/Energy Parts/BatteryLevel",
  component: BatteryLevelComponent,
};

export const BatteryLevel = {
  args: {
    batteryState: 50,
  },
};
