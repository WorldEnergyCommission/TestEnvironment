import { defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import DeviceActions from "@/ui/components/devices/actions/DeviceActions.vue";
import DeviceDescription from "@/ui/components/devices/actions/DeviceDescription.vue";
import PreviewActions from "@/ui/components/devices/actions/PreviewActions.vue";
import SettingsView from "@/ui/components/devices/components/SettingsView.vue";
import ShowEventBase from "@/ui/components/devices/devices/base/ShowEventBase.vue";
import ChartsViewModal from "@/ui/components/devices/mpc/components/ChartsViewModal.vue";

export default defineComponent({
  components: {
    SettingsView,
    DeviceActions,
    ShowEventBase,
    PreviewActions,
    DeviceDescription,
    ChartsViewModal,
  },
  props: {
    deviceData: { default: null, type: Object as PropType<IDevice> },
    /** example: { name: string, type: string } */
    previewData: Object as PropType<any>,
    isPreview: { default: false, type: Boolean },
    /** x2h, x4h, x5h */
    deviceSize: { default: "default", type: String },
    /** class name from icons lib */
    deviceIcon: { default: null, type: String },
    deviceIconSize: { default: "30", type: [String, Number] },
    deviceIconTheme: { default: "theme", type: String },
    /** example: { ShowEvent_errorWarningState: variable } */
    showEventVariable: Object as PropType<any>,
    /** is chart visible */
    isCharts: { default: false, type: Boolean },
    chartsModalWidth: { default: "1750", type: [String, Number] },
    /** x-small, small, large, x-large (vuetify button size) */
    chartsButtonSize: { default: "x-small", type: String },
    settingsModalWidth: { default: null, type: [String, Number] },
    /** is default device layout or used as MPC layout */
    isMPCLayout: { default: false, type: Boolean },
  },
  data() {
    return {
      isSettingsView: false,
    };
  },
  computed: {
    description() {
      return this.isMPCLayout
        ? this.$tm(`mlModelsDescriptions.${this.previewData.type}`)
        : this.$tm(`devicesDescriptions.${this.previewData.type}`);
    },
  },
  methods: {
    switchSettingsView(setting: boolean) {
      this.isSettingsView = setting;
    },
  },
});
