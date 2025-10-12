<template>
  <div>
    <!-- list of devices -->
    <grid-layout
      v-if="dndLayoutDevices.length > 0"
      ref="layout"
      v-model:layout="dndLayoutDevices"
      :breakpoints="{ lg: 1278, md: 966, sm: 654, xs: 342, xxs: 0 }"
      :cols="{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }"
      :is-draggable="false"
      :is-resizable="false"
      :margin="[$vuetify.display.mobile ? 0 : 20, 20]"
      :row-height="156"
      responsive
    >
      <grid-item
        v-for="item in dndLayoutDevices"
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
            <div v-show="false" class="dnd-handler">
              <lynus-icon color="theme" name="drag" size="24" />
            </div>
          </template>
        </component>
      </grid-item>
    </grid-layout>
    <!-- list of charts -->
    <grid-layout
      ref="layout"
      v-model:layout="dndLayoutCharts"
      :breakpoints="{ lg: 1278, md: 966, sm: 654, xs: 342, xxs: 0 }"
      :cols="{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }"
      :is-draggable="false"
      :is-mirrored="false"
      :is-resizable="false"
      :margin="[$vuetify.display.mobile ? 0 : 20, 20]"
      :row-height="156"
      :vertical-compact="true"
      responsive
    >
      <grid-item
        v-for="item in dndLayoutCharts"
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
            <CoreIcon v-show="false" class="dnd-handler swiper-no-swiping" size="20">
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
 * Component that shows filtered devices, charts in the search
 */
export default defineComponent({
  name: "DevicesList",
  mixins: [BaseDevicesList, DND],
  data() {
    const filteredDevicesWithPositions: any = [];
    const chartInstanceWidth: any = null;
    const dndLayoutDevices: any[] = [];
    const dndLayoutCharts: any[] = [];

    return {
      dndLayoutCharts,
      dndLayoutDevices,
      chartInstanceWidth,
      filteredDevicesWithPositions,
    };
  },
  computed: {
    mpcState() {
      return (this.$store.state as RootState).mpc;
    },
    devicesState() {
      return (this.$store.state as RootState).devices;
    },
    projectsState() {
      return (this.$store.state as RootState).projects;
    },
    isProjectOnline() {
      if (this.projectsState.project.meta.disableDevicesWhenOffline === true) {
        return this.projectsState.projectStatus;
      } else {
        return true;
      }
    },
    mlModelTypes() {
      return this.mpcState.mlModelTypes;
    },
    allDevicesTypes() {
      return [...Object.keys(this.devicesTypes), ...Object.keys(this.mlModelTypes)];
    },
    devicesFilter() {
      return this.devicesState.devicesFilter;
    },
    filteredDevices() {
      return this.devicesByRoomLocal.filter((device: any) => {
        if (this.devicesFilter && this.devicesFilter.length) {
          return device.name.toLowerCase().includes(this.devicesFilter.toLowerCase());
        }
        return device;
      });
    },
    charts() {
      const charts = [
        "ColumnChart",
        "LineChart",
        "StreamAnomalyDetection",
        "AreaChart",
        "GaugeChart",
        "chart",
      ];
      return this.filteredDevices.filter((device: any) => charts.includes(device.data.type));
    },
    devices() {
      return this.filteredDevices.filter((device: any) =>
        this.allDevicesTypes.includes(device.data.type),
      );
    },
    devicesTypes(): any {
      return this.$store.getters["devices/devicesTypes"];
    },
    rooms(): any {
      return this.$store.getters["rooms/rooms"];
    },
    devicesByRoom(): (roomId: string) => any {
      return this.$store.getters["devices/devicesByRoom"];
    },
  },
  mounted() {
    this.initDndCharts();
    this.initDndDevices();
  },
  methods: {
    adaptHeightAndWithForMobile(item: any, index: number) {
      const isEnergyDevice: boolean = item.device.data.type === "EnergyView";
      const isChartOrAnomalyDevices: boolean = [
        "chart",
        "HistoryAnomalyDetection",
        "StreamAnomalyDetection",
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
        recalculatedHight = item.device.data.type === "EMS" ? 6 : recalculatedHight;
        item.w = 4;
        item.h = recalculatedHight;
      }

      return item;
    },
    /**
     * Prepares devices list for Drag and Drop grid
     * @return array, list of devices
     */
    initDndDevices() {
      this.dndLayoutDevices = this.devices.map((device: any, index: number, arr: any) => {
        const sizes = this.sizesForDnD(device.data.type);
        return {
          device,
          x: index % 4,
          y: 0,
          ...sizes,
          i: device.id,
        };
      });

      // TODO: refactor this, better refactor this whole component + DeviceListDnD + DeviceListFavorites....
      this.dndLayoutDevices.forEach((item, index) => this.adaptHeightAndWithForMobile(item, index));
    },
    /**
     * Prepares charts list for Drag and Drop grid
     * @return array, list of charts
     */
    initDndCharts() {
      this.dndLayoutCharts = this.charts.map((device: any, index: number, arr: any) => {
        return {
          device,
          x: (index * 2) % 4,
          y: 0,
          w: device.data.selectedWidth === "full" ? 4 : 2,
          h: 4,
          i: device.id,
        };
      });
      this.$nextTick(() => {
        this.chartInstanceWidth = Math.round((this.$refs.layout as any).$el.clientWidth / 2) - 20;
      });

      this.dndLayoutCharts.forEach((item, index) => this.adaptHeightAndWithForMobile(item, index));
    },
    onRoomChange() {
      this.initDndCharts();
      this.initDndDevices();
    },
    updateRoom(payload: any): Promise<void> {
      return this.$store.dispatch("rooms/updateRoom", payload);
    },
  },
  props: {
    devicesByRoomLocal: Array<IDevice>,
  },
  watch: {
    filteredDevices: [
      {
        handler: "onRoomChange",
      },
    ],
  },
});
</script>

<style lang="scss" scoped></style>
