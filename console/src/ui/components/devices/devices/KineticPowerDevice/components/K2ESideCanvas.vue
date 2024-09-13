<template>
  <KonvaCanvas :height="200" @on-width-change="widthChange">
    <K2ECrane
      v-if="craneLayerSize.width"
      :crane-options="craneOptions"
      :layer-options="craneLayerSize"
    >
      <K2EDrives
        :drives="drives"
        :drives-group-options="{
          width: craneOptions.width,
          height: craneOptions.height,
          offsetX: 0,
        }"
        :row-height="rowHeight - rowsGap"
        :step-width="stepWidthContainerFieldConfigLeft"
      />
    </K2ECrane>
    <K2EContainerField
      :container-count="countContainerNegative"
      :container-field-options="containerFieldConfigLeft"
      :items-per-row="itemsPerRow"
      :row-gap="rowsGap"
      :row-height="rowHeight"
      :step-width="stepWidthContainerFieldConfigLeft"
    />
    <!-- default containerFieldConfig is taken and its x value is overwritten -->
    <K2EContainerField
      :container-count="countContainerPositive"
      :container-field-options="containerFieldConfigRight"
      :items-per-row="itemsPerRow"
      :row-gap="rowsGap"
      :row-height="rowHeight"
      :step-width="stepWidthContainerFieldConfigRight"
    />
    <!-- Contains white rect with border -->
    <v-layer>
      <v-rect :config="rectPlaceHolder" />
    </v-layer>
    <!-- Contains Crane Part -->
  </KonvaCanvas>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import K2EContainerField from "./K2EContainerField.vue";
import K2ECrane from "./K2ECrane.vue";
import KonvaCanvas from "./KonvaCanvas.vue";
import { RootState } from "@/store/types";
import K2EDrives from "@/ui/components/devices/devices/KineticPowerDevice/components/K2EDrives/index.vue";

export default defineComponent({
  components: {
    KonvaCanvas,
    K2EContainerField,
    K2ECrane,
    K2EDrives,
  },
  props: {
    deviceData: Object as PropType<any>,
  },
  data() {
    const currentCanvasWidth: any = null;

    return {
      currentCanvasWidth,
      height: 200,
      // Total container count that can be displayed.
      containerCountMax: 32,
      horizontalSpacing: 5,
      numberOfRows: 10,
      rowsGap: 2,
    };
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    rectPlaceHolder() {
      return {
        x: this.positiveContainerFieldOffset - 2,
        y: (this.numberOfRows / 2) * this.rowHeight,
        width: this.currentCanvasWidth / 2,
        height: (this.numberOfRows / 2) * this.rowHeight,
        fill: "yellow",
        stroke: "black",
        strokeWidth: 1,
      };
    },
    /**
     *  Number of containers per row.
     *  */
    itemsPerRow() {
      return this.containerCountMax / 2;
    },
    containerFieldConfigLeft() {
      const config = { width: this.currentCanvasWidth / 2 };
      return { ...config, ...{ x: 0, y: this.height } };
    },
    stepWidthContainerFieldConfigLeft() {
      return this.containerFieldConfigLeft?.width / this.itemsPerRow;
    },
    containerFieldConfigRight() {
      const config = { width: this.currentCanvasWidth / 2 };
      return {
        ...config,
        ...{
          x: this.positiveContainerFieldOffset - 2,
          y: (this.numberOfRows / 2) * this.rowHeight,
        },
      };
    },
    stepWidthContainerFieldConfigRight() {
      return this.containerFieldConfigRight?.width / this.itemsPerRow;
    },
    rowHeight() {
      return this.height / this.numberOfRows;
    },
    measurements() {
      return this.measurementsState.measurements;
    },
    /**
     * prop that will be needed to control the max height that the drives can go up and down in sideview
     * */
    currentDriveHeight() {
      if (this.cranePositionX > 0) {
        return this.height / 2;
      } else {
        return this.height;
      }
    },
    /**
     * returns the current value for cranePositionX
     *  */
    cranePositionX() {
      const val: any = this.measurements.get(this.deviceData.cranePositionX);
      // return 6.25;
      return parseFloat(val);
    },
    /**
     * returns the current value for countContainerNegative
     */
    countContainerNegative() {
      const val: number = parseInt(
        this.measurements.get(this.deviceData.countContainerNegative) as any,
        10,
      );
      return val > this.containerCountMax ? this.containerCountMax : val;
    },
    /**
     * returns the current value for countContainerPositive
     */
    countContainerPositive() {
      const val: number = parseInt(
        this.measurements.get(this.deviceData.countContainerPositive) as any,
        10,
      );
      return val > this.containerCountMax ? this.containerCountMax : val;
    },
    /**
     * Returns the offset at which the right container field should be drawn.
     */
    positiveContainerFieldOffset() {
      return this.currentCanvasWidth / 2 + 2;
    },
    craneSize() {
      const numberOfDrives = Object.keys(this.drives).length;
      return {
        width: this.stepWidthContainerFieldConfigLeft * numberOfDrives,
        height: this.height,
      };
    },
    craneLayerSize() {
      return {
        width: this.currentCanvasWidth,
        x: this.craneSize.width / 2,
        height: this.height,
      };
    },
    cranePositionXMod() {
      let offset = 0;
      if (this.cranePositionX <= -6.25) {
        offset = 0;
      } else if (this.cranePositionX >= 6.25) {
        offset = this.stepWidthContainerFieldConfigRight;
      } else {
        offset = this.stepWidthContainerFieldConfigRight / 2;
      }
      return (
        ((this.cranePositionX + 100) / 200) * this.craneLayerSize.width -
        this.craneSize.width / 2 -
        offset
      );
    },
    craneOptions() {
      return {
        ...this.craneSize,
        fill: "red",
        stroke: "black",
        offsetX: 0,
        x: this.cranePositionXMod,
        y: 0,
      };
    },
    craneCellInstanceWidth() {
      const borderWidth = 1;
      const spacingWidth = (this.itemsPerRow + 1) * this.horizontalSpacing;
      return (this.currentCanvasWidth / 2 - spacingWidth) / this.itemsPerRow - 2 * borderWidth;
    },
    drives() {
      return this.deviceData?.drives;
    },
  },
  methods: {
    widthChange(width: number) {
      this.currentCanvasWidth = width;
    },
  },
});
</script>

<style lang="scss" scoped></style>
