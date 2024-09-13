<template>
  <div class="curved-display-padding-bottom">
    <CoreTabs
      :key="$i18n.locale"
      v-model="workbenchCurrentTab"
      center-active
      show-arrows
      :style="$vuetify.display.mobile ? 'margin-inline: -1em;' : ''"
    >
      <CoreTab v-for="(item, index) in workbenchFiltered" :key="index">
        {{ item.tabName }}
      </CoreTab>
    </CoreTabs>

    <CoreWindow v-model="workbenchCurrentTab" :touch="false">
      <CoreWindowItem v-for="(item, index) in workbenchFiltered" :key="`c-${index}`">
        <CoreColumn v-if="actualDevicesLoaded" class="px-0" style="overflow: auto">
          <!-- current workbench table -->
          <!-- itemsPerPage: number of elements in table -->
          <component
            :is="item.table"
            v-if="workbenchCurrentTab === index"
            v-bind="{ itemsPerPage: itemCountPerPage }"
          />
        </CoreColumn>
      </CoreWindowItem>
    </CoreWindow>
    <PreviewsModal v-if="!$vuetify.display.mobile" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { IAnomalyDetection } from "@/store/modules/anomalyDetection/types";
import { IDevice } from "@/store/modules/devices/types";
import { IMLModel } from "@/store/modules/mpc/types";
import { RootState } from "@/store/types";
import PreviewsModal from "@/ui/components/modals/PreviewsModal.vue";
import AnomalyDetectionTable from "@/ui/components/tables/workbench/AnomalyDetectionTable.vue";
import ChartsTable from "@/ui/components/tables/workbench/ChartsTable.vue";
import DataMappingsTable from "@/ui/components/tables/workbench/DataMappingsTable.vue";
import DevicesTable from "@/ui/components/tables/workbench/DevicesTable.vue";
import ModulesTable from "@/ui/components/tables/workbench/ModulesTable.vue";
import MPCTable from "@/ui/components/tables/workbench/MPCTable.vue";
import { envWorkbenchCategories } from "@/utils/env";

/**
 * Page for creating devices, charts, MPC devices
 */
export default defineComponent({
  components: {
    DevicesTable,
    AnomalyDetectionTable,
    ChartsTable,
    MPCTable,
    PreviewsModal,
    DataMappingsTable,
    ModulesTable,
  },
  data() {
    const itemCountPerPage: number = 100;

    return {
      itemCountPerPage,
      actualDevicesLoaded: false,
    };
  },
  computed: {
    appState() {
      return (this.$store.state as RootState).app;
    },
    workbenchCurrentTab: {
      get() {
        return this.appState.workbenchCurrentTab;
      },
      set(value: any) {
        this.$store.commit("app/setWorkbenchTab", value);
      },
    },
    workbench() {
      return [
        {
          tab: "Devices",
          tabName: `${this.$rt((this.$tm(this.localisationPath) as any)[0])} (${
            this.devices.length || 0
          })`,
          table: "DevicesTable",
        },
        {
          tab: "Anomaly Detection",
          tabName: `${this.$rt((this.$tm(this.localisationPath) as any)[1])} (${
            this.anomalyDetectionDevices.length || 0
          })`,
          table: "AnomalyDetectionTable",
        },
        {
          tab: "Charts",
          tabName: `${this.$rt((this.$tm(this.localisationPath) as any)[2])} (${
            this.charts.length || 0
          })`,
          table: "ChartsTable",
        },
        {
          tab: "MPC",
          tabName: `${this.$rt((this.$tm(this.localisationPath) as any)[3])} (${
            this.mlModelDevices.length || 0
          })`,
          table: "MPCTable",
        },
        {
          tab: "DataMappings",
          tabName: "Data Mapping TODO Translate",
          table: "DataMappingsTable",
        },
        {
          tab: "Modules",
          tabName: "Modules",
          table: "ModulesTable",
        },
      ];
    },
    workbenchFiltered() {
      return this.workbench.filter((e) => envWorkbenchCategories.includes(e.tab));
    },
    localisationPath() {
      return "uiComponents.workbench.workbenchTabs";
    },
    charts(): any {
      return this.$store.getters["charts/charts"];
    },
    mpcControllers(): any {
      return this.$store.getters["mpc/mpcControllers"];
    },
    anomalyDetectionDevices(): IAnomalyDetection[] {
      return this.$store.getters["anomalyDetection/anomalyDetectionDevices"];
    },
    devices(): IDevice[] {
      return this.$store.getters["devices/devices"];
    },
    mlModelDevices(): IMLModel[] {
      return this.$store.getters["mpc/mlModelDevices"];
    },
  },
  async mounted() {
    // Load Rooms, Devices, MPC
    await Promise.allSettled([
      this.$store.dispatch("rooms/fetchRooms", this.$route.params.id as string),
      this.$store.dispatch("devices/fetchDevices", this.$route.params.id as string),
      this.$store.dispatch("mpc/fetchMPCListByProject", this.$route.params.id as string),
    ]);
    // turn of loader
    this.actualDevicesLoaded = true;

    // load weather status
    await this.$store.dispatch("mpc/fetchMPCWeatherStatus");
  },
});
</script>
<style lang="scss">
.library-activator {
  text-transform: unset !important;
}
</style>
