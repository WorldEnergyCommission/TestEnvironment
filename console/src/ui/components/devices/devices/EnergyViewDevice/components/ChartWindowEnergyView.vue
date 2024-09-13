<template>
  <EMSChartWindow :items="items">
    <template #default="{ tab }">
      <component
        :is="items[tab].view"
        :mappings-list="mainMappingsList"
        :meta-data="metaData"
        :soc-mapping="socMapping"
        :systems-mappings="systemsMappings"
        :is-preview="isPreview"
      />
    </template>
  </EMSChartWindow>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { SystemTypeString } from "../EnergyViewSystems";
import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";
import DeviceChartsView from "@/ui/components/devices/devices/EnergyViewDevice/components/DeviceChartsView.vue";
import EMSChartWindow from "@/ui/components/devices/mpc/EMS/components/charts/ChartWindow.vue";

export default defineComponent({
  components: {
    DeviceChartsView,
    EMSChartWindow,
  },
  extends: BaseDevice,
  props: {
    metaData: Object as PropType<any>,
    isPreview: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    const socMapping: any = {
      battery: [],
    };
    const systemsMappings: Record<SystemTypeString, any[]> = {
      pvSystem: [],
      generator: [],
      heatProducer: [],
      battery: [],
      grid: [],
      houseConsumption: [],
      evChargingStation: [],
      electricHeating: [],
      heatingPump: [],
      otherBigConsumer: [],
      heatMeter: [],
    };
    const mainMappingsList: Record<SystemTypeString, any> = {
      pvSystem: false,
      generator: false,
      heatProducer: false,
      battery: false,
      grid: false,
      houseConsumption: false,
      evChargingStation: false,
      electricHeating: false,
      heatingPump: false,
      otherBigConsumer: false,
      heatMeter: false,
    };

    return {
      isVisible: false,
      tab: null,
      mainMappingsList,
      systemsMappings,
      socMapping,
    };
  },
  computed: {
    items() {
      return [
        {
          title: this.$t("devices.EnergyView.ChartsWindow.titleForTab"),
          view: "DeviceChartsView",
        },
      ];
    },
  },
  watch: {
    variableData: [
      {
        handler: "handlePropChange",
      },
    ],
  },
  created() {
    this.initMainMappingsList();
    this.initSystemMappingsList();
  },
  methods: {
    /**
     * Initalises the mainMappingList.
     * It contains an Object with each possible device and with that the Bar with the Buttons to select the right chart will be created.
     */
    initMainMappingsList() {
      Object.entries(this.variableData as Record<string, any>).forEach(
        (element: any, index: number) => {
          const resultEnergyPartName: SystemTypeString = element[0]
            .split("_")[0]
            .replace(/[0-9]/g, "");
          this.mainMappingsList[resultEnergyPartName] = true;
        },
      );
    },
    /**
     * Initialises the systemsMappings
     * It contains an Object with an Array for each possible MappingEntrie (PV,Generator,Grid etc.).
     * It will be used to create the chartObject to display the right
     * Values in the Chart.
     */
    initSystemMappingsList() {
      Object.entries(this.variableData as Record<string, any>).forEach(
        (varElement: any, index: number) => {
          const filteredElementType: SystemTypeString = varElement[0]
            .split("_")[0]
            .replace(/[0-9]/g, "");
          if (varElement[0].includes("actualValue") === true) {
            this.systemsMappings[filteredElementType].push(varElement[1]);
          } else if (varElement[0].includes("socValue") === true) {
            this.socMapping[filteredElementType].push(varElement[1]);
          }
        },
      );
    },
    /**
     * Clears both lists in order to refill them with the new Data
     */
    clearLists() {
      this.mainMappingsList = {
        pvSystem: false,
        generator: false,
        heatProducer: false,
        grid: false,
        battery: false,
        houseConsumption: false,
        evChargingStation: false,
        electricHeating: false,
        heatingPump: false,
        otherBigConsumer: false,
        heatMeter: false,
      };

      this.systemsMappings = {
        pvSystem: [],
        generator: [],
        heatProducer: [],
        grid: [],
        battery: [],
        houseConsumption: [],
        evChargingStation: [],
        electricHeating: [],
        heatingPump: [],
        otherBigConsumer: [],
        heatMeter: [],
      };

      this.socMapping = {
        battery: [],
      };
    },
    handlePropChange() {
      this.clearLists();
      this.initMainMappingsList();
      this.initSystemMappingsList();
    },
  },
});
</script>

<style lang="scss" scoped>
@import "./src/ui/scss/variables";

.dialog-view-design {
  background: transparent !important;

  .dialog-view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .dialog-view-title {
      font-size: 30px;
      color: rgb(var(--v-theme-accentLight));
      height: 40px;
      line-height: 1;
    }
  }

  .dialog-view-body {
    background: rgb(var(--v-theme-deviceBackground));
    border-radius: $border-radius-root !important;
    padding: 20px;
  }
}
</style>
