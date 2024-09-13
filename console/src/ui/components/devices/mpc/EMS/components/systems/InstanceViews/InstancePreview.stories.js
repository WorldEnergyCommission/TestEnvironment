import InstancePreviewComponent from "./InstancePreview.vue";

export default {
  title: "Devices/MPC/EMS/systems/InstanceView/InstancePreview",
  component: InstancePreviewComponent,
};

export const InstancePreview = {
  args: {
    systemTypeString: "grid",
    previewActualValue: 10,
    outputFieldActualPower: 20,
    batterySOCValue: 10,
    instanceData: {
      status_bypass: "actualValue",
      status_island: "actualValue",
    },
  },
};
