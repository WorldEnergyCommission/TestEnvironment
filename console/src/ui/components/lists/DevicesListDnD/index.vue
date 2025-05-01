<template>
  <div
    v-if="render"
    :style="`margin: ${$vuetify.display.mobile ? '0px;' : '20px 20px 0px 0px;'}`"
    class="w-100 h-100"
  >
    <grid-layout
      ref="layout"
      v-model:layout="dndLayout"
      :col-num="numOfCols"
      :is-draggable="isDnDActive"
      :is-resizable="false"
      :margin="[$vuetify.display.mobile ? 0 : 20, 20]"
      :row-height="156"
      :use-css-transforms="false"
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
        :use-css-transforms="false"
        drag-allow-from="i.dnd-handler"
      >
        <component
          :is="item.device.data.type"
          :chart-data="item.device"
          :chart-width="chartInstanceWidth"
          :class="[{ disbaleDeviceOnEventOffline: !isProjectOnline }]"
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
import { defineComponent, PropType } from "vue";

import BaseDevicesList from "../BaseDevicesList";
import { IDevice } from "@/store/modules/devices/types";
import { IProject } from "@/store/modules/projects/types";
import { IRoom } from "@/store/modules/rooms/types";
import { RootState } from "@/store/types";
import { DND, IDeviceDnDLayout, IDnDSize, IDnDPosition } from "@/ui/mixins/dnd";

/**
 * Component that represent all devices list in Drag and Drop grid.
 * Used in Rooms page.
 */
export default defineComponent({
  name: "DevicesListDnD",
  mixins: [BaseDevicesList, DND],
  props: {
    devicesByRoomLocal: {
      type: Array as PropType<IDevice[]>,
    },
    currentRoomData: {
      type: Object as PropType<IRoom | undefined>,
    },
    isActive: { default: false, type: Boolean },
  },
  data() {
    const filteredDevicesWithPositions: any = [];
    const chartInstanceWidth: any = null;
    const dndLayout: IDeviceDnDLayout[] = [];

    return {
      dndLayout,
      chartInstanceWidth,
      filteredDevicesWithPositions,
      finalRoomWithNewPositions: [],
      render: false,
    };
  },
  computed: {
    devicesState() {
      return (this.$store.state as RootState).devices;
    },
    projectsState() {
      return (this.$store.state as RootState).projects;
    },
    devicesTypes() {
      return Object.keys(this.devicesState.devicesTypes);
    },
    devicesPositionsByCurrentRoom() {
      if (
        this.currentRoomData &&
        this.currentRoomData.meta &&
        this.currentRoomData.meta.devicesPositions
      ) {
        return this.currentRoomData.meta.devicesPositions;
      }
      return [];
    },
    isProjectOnline() {
      if (this.projectsState.project.meta.disableDevicesWhenOffline === true) {
        return this.projectsState.projectStatus;
      } else {
        return true;
      }
    },
    rooms(): any {
      return this.$store.getters["rooms/rooms"];
    },
    project(): IProject {
      return this.$store.getters["projects/project"];
    },
    isDnDActive(): boolean {
      return this.$store.getters["projects/isDnDActive"];
    },
    devicesByRoom(): (roomId: string) => any {
      return this.$store.getters["devices/devicesByRoom"];
    },
    numOfCols(): number {
      switch (this.$vuetify.display.name) {
        case "xs":
          return 1;
        case "sm":
          return 2;
        case "md":
          return 3;
        default:
          return 4;
      }
    },
  },
  watch: {
    devicesByRoomLocal: [
      {
        handler: "onRoomChange",
      },
    ],
    isActive: [
      {
        handler: "onRoomChange",
      },
    ],
    isDnDActive: [
      {
        handler: "onIsDnDActiveChange",
      },
    ],
    dndLayout: [
      {
        handler: "onDevicesChange",
      },
    ],
  },
  mounted() {
    this.onRoomChange({});
  },
  methods: {
    /**
     * Prepares list of devices for Drag and Drop grid
     * @param {array} devices list of devices
     */
    initDndDevices(devices: IDevice[]) {
      this.render = false;
      const lastDeviceOnFirstCol = () => {
        if (!this.devicesPositionsByCurrentRoom.length) return;
        // filter all devices which on position x = 0, return their y-positions
        const arr = this.devicesPositionsByCurrentRoom
          .filter((device: any) => device.x === 0)
          .map((d: any) => d.y);
        // define last y-position
        const lastPos = Math.max.apply(null, arr);
        return this.devicesPositionsByCurrentRoom
          .filter((device: any) => device.x === 0)
          .find((el: any) => el.y === lastPos);
      };
      const lastDeviceOnFirstColSize = lastDeviceOnFirstCol()
        ? this.sizesForDnD(
            devices.find((dev: IDevice) => dev.id === lastDeviceOnFirstCol().i)?.data?.type,
          )
        : null;
      // define start position for new device what was added
      const startPositionForNewDevice =
        lastDeviceOnFirstColSize && lastDeviceOnFirstCol()
          ? lastDeviceOnFirstColSize.h + lastDeviceOnFirstCol().y
          : 0;

      this.dndLayout = devices.map((device: IDevice) => {
        const isFullWidthChart = device.data.selectedWidth === "full";

        // define devices positions
        const positions = (): IDnDPosition => {
          if (this.currentRoomData && this.currentRoomData.meta.devicesPositions) {
            const currentDevicePositions = this.currentRoomData.meta.devicesPositions.find(
              (item: any) => item.i === device.id,
            );

            // need when chart instance switch between full width and half width
            let snapshot = null;
            if (currentDevicePositions) {
              snapshot = { ...currentDevicePositions };
              if (isFullWidthChart) snapshot.x = 0;
              else snapshot.x = currentDevicePositions.x;
            }

            return (
              snapshot || {
                x: 0,
                y: startPositionForNewDevice,
                i: device.id,
              }
            );
          } else {
            return {
              x: 0,
              y: 0,
              i: device.id,
            };
          }
        };

        return {
          device,
          ...positions(),
          ...this.sizesForDnD(device.data.type),
        };
      });
      // TODO: change prop names, remove chartWidth, count device init width from container width
      this.$nextTick(() => {
        const layoutRef = this.$refs.layout as any;
        if (!layoutRef) return;
        this.chartInstanceWidth = Math.round(layoutRef.$el.clientWidth / 2) - 40;
      });

      // define sizes for EnergyView, charts
      this.dndLayout.forEach((item: any, index: number) => {
        const isEnergyDevice: boolean = ["EnergyView", "AdamCurve"].includes(item.device.data.type);
        const isChartOrAnomalyDevices: boolean = [
          "chart",
          "HistoryAnomalyDetection",
          "StreamAnomalyDetection",
          "WeekTrendSummary",
        ].some((type: string) => type === item.device.data.type);
        if (isChartOrAnomalyDevices || isEnergyDevice) {
          item.w = item.device.data.selectedWidth === "half" ? 2 : 4;
          item.h = isEnergyDevice ? 4 : item.h;
        }
        if (this.$vuetify.display.md) {
          item.w = 1;
        }
        if (this.$vuetify.display.mobile) {
          let recalculatedHight = item.h;
          recalculatedHight = isEnergyDevice ? 3 : recalculatedHight;
          recalculatedHight = isChartOrAnomalyDevices ? 5 : recalculatedHight;
          recalculatedHight = item.device.data.type === "EMS" ? 6 : recalculatedHight;
          recalculatedHight = item.device.data.type === "SSP" ? 3 : recalculatedHight;
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
      this.filteredDevicesWithPositions = layout.map((item: any) => {
        return {
          x: item.x,
          y: item.y,
          i: item.i,
        };
      });
      if (this.currentRoomData) {
        const copy = JSON.parse(JSON.stringify(this.currentRoomData));
        copy.meta.devicesPositions = this.filteredDevicesWithPositions;
        this.finalRoomWithNewPositions = copy;
      }
    },
    onRoomChange(val: any) {
      if (this.devicesByRoomLocal?.length) {
        this.initDndDevices(this.devicesByRoomLocal!);
      }
    },
    async onIsDnDActiveChange(val: boolean) {
      if (!val) {
        // console.log('======= send dnd positions (Areas) =======');
        this.updateRoom({ room: this.finalRoomWithNewPositions });
      }
    },
    onDevicesChange() {
      this.render = true;
    },
    createRoomState(roomName: string): Promise<void> {
      return this.$store.dispatch("rooms/createRoom", roomName);
    },
    updateRoom(payload: any): Promise<void> {
      return this.$store.dispatch("rooms/updateRoom", payload);
    },
  },
});
</script>

<style lang="scss">
.devices-dnd-grid-wrapper {
  .vue-grid-item.vue-grid-placeholder {
    background-color: rgb(var(--v-theme-dndItemBackground));
    transition-duration: 1s;
    opacity: 0.7;
  }
}

.jiggle {
  animation: jiggle 0.3s infinite;
  animation-name: jiggle;
  animation-duration: 0.3s;
  -webkit-animation: jiggle 0.3s infinite;
  -moz-animation-duration: 0.3s;
  -moz-animation-name: jiggle;
  -moz-animation-iteration-count: infinite;
  -webkit-transform: rotate(-1deg);
  -moz-transform: rotate(-1deg);
}

@keyframes jiggle {
  0% {
    transform: rotate(-1deg);
    animation-timing-function: ease-in;
  }
  50% {
    transform: rotate(1deg);
    animation-timing-function: ease-out;
  }
}

@-webkit-keyframes jiggle {
  0% {
    -webkit-transform: rotate(-1deg);
    animation-timing-function: ease-in;
  }
  50% {
    -webkit-transform: rotate(1deg);
    animation-timing-function: ease-out;
  }
}

@-moz-keyframes jiggle {
  0% {
    -moz-transform: rotate(-1deg);
    animation-timing-function: ease-in;
  }
  50% {
    -moz-transform: rotate(1deg);
    animation-timing-function: ease-out;
  }
}
</style>
