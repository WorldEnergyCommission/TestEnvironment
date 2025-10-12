<template>
  <div>
    <grid-layout
      ref="layout"
      v-model:layout="dndLayout"
      :breakpoints="{ lg: 1278, md: 966, sm: 654, xs: 342, xxs: 0 }"
      :cols="{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }"
      :is-draggable="isDnDActive"
      :is-mirrored="false"
      :is-resizable="false"
      :margin="[$vuetify.display.mobile ? 0 : 20, 20]"
      :responsive="true"
      :row-height="156"
      :use-css-transforms="true"
      :vertical-compact="true"
      @layout-updated="layoutUpdatedEvent"
    >
      <grid-item
        v-for="item in dndLayout"
        :key="item.i"
        :h="item.h"
        :i="item.i"
        :w="item.w"
        :x="item.x"
        :y="item.y"
        drag-allow-from="i.dnd-handler"
      >
        <component
          :is="item.device.data.type"
          :chart-data="item.device"
          :chart-width="chartInstanceWidth"
          :class="{ disbaleDeviceOnEventOffline: !isProjectOnline }"
          :device-data="item.device"
          style="height: 100%"
        >
          <template #dnd>
            <CoreIcon v-show="isDnDActive" class="dnd-handler swiper-no-swiping" size="20">
              fas fa-arrows-alt
            </CoreIcon>
          </template>
        </component>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import { RootState } from "@/store/types";
import { DND } from "@/ui/mixins/dnd";
import BaseDevicesList from "../BaseDevicesList";

/**
 * Component that represent all devices list in Drag and Drop grid.
 * Used in Favorites page.
 */
export default defineComponent({
  name: "DevicesListFavorites",
  mixins: [BaseDevicesList, DND],
  data() {
    const finalProjectWithNewPositions: any = null;
    const filteredDevicesWithPositions: any = [];
    const chartInstanceWidth: any = null;
    const dndLayout: any[] = [];

    return {
      dndLayout,
      chartInstanceWidth,
      filteredDevicesWithPositions,
      finalProjectWithNewPositions,
    };
  },
  computed: {
    appState() {
      return (this.$store.state as RootState).app;
    },
    devicesState() {
      return (this.$store.state as RootState).devices;
    },
    projectsState() {
      return (this.$store.state as RootState).projects;
    },
    devicesTypes() {
      return Object.keys(this.devicesState.devicesTypes);
    },
    favoritesDevicesPositions() {
      if (this.project?.meta?.favoritesDevicesPositions?.[this.user.id])
        return this.project.meta.favoritesDevicesPositions[this.user.id];
      return [];
    },
    isProjectOnline() {
      if (this.projectsState.project.meta.disableDevicesWhenOffline === true) {
        return this.projectsState.projectStatus;
      } else {
        return true;
      }
    },
    user() {
      return this.appState.user;
    },
    itemWith() {
      return this.$vuetify.display.mobile ? 4 : 1;
    },
    project(): any {
      return (this.$store.state as RootState).projects.project;
    },
    favoritesDevices(): Array<IDevice> {
      return this.$store.getters["devices/favoritesDevices"];
    },
    isDnDActive(): boolean {
      return this.$store.getters["projects/isDnDActive"];
    },
  },
  watch: {
    favoritesDevices: [
      {
        handler: "onDevicesChange",
      },
    ],
    isDnDActive: [
      {
        handler: "onisDnDActiveChange",
      },
    ],
  },
  mounted() {
    this.initDndDevices(this.favoritesDevices);
  },
  methods: {
    currentDevicePositions(device: any) {
      return this.favoritesDevicesPositions.find((item: any) => item.i === device.id);
    },
    /**
     * Prepares list of devices for Drag and Drop grid
     * @param {array} devices list of devices
     */
    initDndDevices(devices: any) {
      const lastDeviceOnFirstCol = () => {
        if (!this.favoritesDevicesPositions.length) return;
        // filter all devices which on position x = 0, return their y-positions
        const arr = this.favoritesDevicesPositions
          .filter((device: any) => device.x === 0)
          .map((d: any) => d.y);
        // define last y-position
        const lastPos = Math.max.apply(null, arr);
        return this.favoritesDevicesPositions
          .filter((device: any) => device.x === 0)
          .find((el: any) => el.y === lastPos);
      };
      const lastDeviceOnFirstColSize = lastDeviceOnFirstCol()
        ? this.sizesForDnD(
            devices.find((dev: any) => dev.id === lastDeviceOnFirstCol().i)?.data?.type,
          )
        : null;
      // define start position for new device what was added
      const startPositionForNewDevice =
        lastDeviceOnFirstColSize && lastDeviceOnFirstCol()
          ? lastDeviceOnFirstColSize.h + lastDeviceOnFirstCol().y
          : 0;

      this.dndLayout = devices.map((device: any) => {
        const isFullWidthChart = device.data.selectedWidth === "full";

        const positions = () => {
          if (this.favoritesDevicesPositions.length) {
            // need when chart instance switch between full width and half width
            let snapshot = null;
            if (this.currentDevicePositions(device)) {
              snapshot = { ...this.currentDevicePositions(device) };
              if (isFullWidthChart) snapshot.x = 0;
              else snapshot.x = this.currentDevicePositions(device).x;
            }

            return (
              snapshot || {
                x: 0,
                y: startPositionForNewDevice,
                i: device.id,
              }
            );
          }
          return {
            x: 0,
            y: 0,
            i: device.id,
          };
        };
        return {
          device,
          ...positions(),
          ...this.sizesForDnD(device.data.type),
        };
      });
      this.$nextTick(() => {
        this.chartInstanceWidth = Math.round((this.$refs.layout as any).$el.clientWidth / 2) - 40;
      });

      // define sizes for EnergyView, charts
      // TODO: refactor from DevciesListDnD
      this.dndLayout.forEach((item: any, index: number) => {
        const isEnergyDevice: boolean = item.device.data.type === "EnergyView";
        const isChartOrAnomalyDevices: boolean = [
          "chart",
          "HistoryAnomalyDetection",
          "StreamAnomalyDetection",
          "WeekTrendSummary",
          "LoadManagementList",
        ].some((type: string) => type === item.device.data.type);
        if (isChartOrAnomalyDevices || isEnergyDevice) {
          item.w = item.device.data.selectedWidth === "half" ? 2 : 4;
          item.h = isEnergyDevice ? 4 : item.h;
        }
        if (this.$vuetify.display.mobile) {
          let recalculatedHight = item.h;
          recalculatedHight = isEnergyDevice ? 3 : recalculatedHight;
          recalculatedHight = isChartOrAnomalyDevices ? 5 : recalculatedHight;
          recalculatedHight = item.device.data.type === "SSP" ? 3 : recalculatedHight;
          recalculatedHight = item.device.data.type === "EMS" ? 6 : recalculatedHight;
          item.w = 4;
          item.h = recalculatedHight;
        }
      });
    },
    /**
     * Saves actual devices positions when Drag and Drop layout was updated
     * @param {array} layout Drag and Drop grid items list
     */
    layoutUpdatedEvent(layout: any) {
      this.filteredDevicesWithPositions = layout.map((item: any) => ({
        x: item.x,
        y: item.y,
        i: item.i,
      }));
      if (this.project) {
        // const copy = JSON.parse(JSON.stringify(this.project));
        const copy2 = JSON.parse(JSON.stringify(this.project));
        // copy.meta.favoritesDevicesPositions = this.filteredDevicesWithPositions;
        copy2.meta.favoritesDevicesPositions = copy2?.meta?.favoritesDevicesPositions?.length
          ? copy2.meta.favoritesDevicesPositions
          : {};
        copy2.meta.favoritesDevicesPositions[this.user.id] = this.filteredDevicesWithPositions;
        this.finalProjectWithNewPositions = copy2;
        // console.log(this.finalProjectWithNewPositions);
      }
    },
    onDevicesChange(devices: any) {
      this.initDndDevices(this.favoritesDevices);
    },
    async onisDnDActiveChange(val: boolean) {
      if (!val) {
        this.finalProjectWithNewPositions.meta.isDNDActive = false;
        this.updateProject(this.finalProjectWithNewPositions);
      }
    },
    updateProject(project: any): Promise<void> {
      return this.$store.dispatch("projects/updateProject", project);
    },
  },
});
</script>

<style lang="scss">
.project-favorites {
  .devices-dnd-grid-wrapper {
    .vue-grid-item.vue-grid-placeholder {
      background-color: rgb(var(--v-theme-dndItemBackground));
      transition-duration: 1s;
      opacity: 0.7;
    }
  }
}
</style>
