<template>
  <KonvaCanvas @on-width-change="widthChange">
    <K2EContainerField
      :container-count="countContainerNegative"
      :container-field-options="leftContainerFieldOptions"
      :container-item-height="height / 2 - 4"
      :items-per-row="itemsPerRow"
      :row-gap="rowsGap"
      :row-height="rowHeight"
      :step-width="stepWidth"
    />
    <v-layer>
      <v-rect :config="backgroundRect" />
    </v-layer>
    <v-layer>
      <v-line :config="middleLineConfig" />
    </v-layer>
    <K2EContainerField
      :container-count="countContainerPositive"
      :container-field-options="rightContainerFieldOptions"
      :container-item-height="height / 2 - 4"
      :items-per-row="itemsPerRow"
      :row-gap="rowsGap"
      :row-height="rowHeight"
      :step-width="stepWidth"
    />
    <K2ECrane
      v-if="craneLayerSize.width"
      :crane-options="craneOptions"
      :layer-options="craneLayerSize"
    >
      <K2EArrow
        :arrow-direction="arrowDirection"
        :arrow-options="{
          width: craneOptions.width,
          height: craneOptions.height,
          offsetX: 0,
        }"
      />
    </K2ECrane>
  </KonvaCanvas>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import K2EContainerField from "./K2EContainerField.vue";
import K2ECrane from "./K2ECrane.vue";
import KonvaCanvas from "./KonvaCanvas.vue";
import { RootState } from "@/store/types";
import K2EArrow from "@/ui/components/devices/devices/KineticPowerDevice/components/K2EArrow.vue";

export default defineComponent({
  components: {
    KonvaCanvas,
    K2EContainerField,
    K2ECrane,
    K2EArrow,
  },
  props: {
    deviceData: Object as PropType<any>,
  },
  data() {
    const currentCanvasWidth: any = null;

    return {
      currentCanvasWidth,
      numberOfRows: 2,
      rowsGap: 2,
      height: 50,
      /**
       * Total container count that can be displayed.
       */
      containerCountMax: 32,
    };
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    /**
     * Number of containers per row.
     */
    itemsPerRow() {
      return this.containerCountMax / 2;
    },
    middleLineConfig() {
      return {
        points: [this.currentCanvasWidth / 2 - 2, 0, this.currentCanvasWidth / 2 - 2, this.height],
        stroke: (this.$vuetify.theme as any).currentTheme.primaryBorder,
      };
    },
    backgroundRect() {
      return {
        x: this.positiveContainerFieldOffset,
        y: 0,
        width: this.rightContainerFieldOptions.width,
        height: this.height,
        fill: "yellow",
      };
    },
    leftContainerFieldOptions() {
      return {
        width: this.currentCanvasWidth / 2,
        y: this.height - this.rowsGap,
        x: -4,
      };
    },
    rightContainerFieldOptions() {
      return {
        width: this.currentCanvasWidth / 2,
        y: this.height - this.rowsGap,
        x: this.positiveContainerFieldOffset,
      };
    },
    stepWidth() {
      return this.leftContainerFieldOptions?.width / this.itemsPerRow;
    },
    rowHeight() {
      return (this.height - this.rowsGap * 2) / this.numberOfRows;
    },
    measurements() {
      return this.measurementsState.measurements;
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
      return this.currentCanvasWidth / 2;
    },
    cranePositionX() {
      const val: any = this.measurements.get(this.deviceData.cranePositionX);
      return parseFloat(val);
    },
    craneSize() {
      return {
        width: this.stepWidth * 2,
        height: this.height,
      };
    },
    craneLayerSize() {
      return {
        width: this.currentCanvasWidth,
        x: this.craneSize.width / 2,
        height: this.height,
        offsetX: this.cranePositionX > 0 ? -2 : 2,
      };
    },
    cranePositionXMod() {
      let offset = 0;
      if (this.cranePositionX <= -6.25) {
        offset = 0;
      } else if (this.cranePositionX >= 6.25) {
        offset = this.stepWidth;
      } else {
        offset = this.stepWidth / 2;
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
    craneStateHorizontal() {
      const val: any = this.measurements.get(this.deviceData.stateHorizontal);
      return parseInt(val, 10);
    },
    drives() {
      return this.deviceData?.drives;
    },
    drivesYPositions() {
      const arrVariablesKeys = Object.values(this.drives).map((drive: any) => drive.stateVertical);
      return arrVariablesKeys.map((el: any) => this.measurements.get(el));
    },
    arrowDirectionHorizontal() {
      const horizontalVars = [null, "left", "right"];
      return horizontalVars[this.craneStateHorizontal];
    },
    arrowDirectionVertical() {
      const isMovingUp = this.drivesYPositions.some((el: any) => el === 1);
      const isMovingDown = this.drivesYPositions.some((el: any) => el === 2);
      if (isMovingUp) return "up";
      if (isMovingDown) return "down";
      else return null;
    },
    arrowDirection() {
      return this.arrowDirectionHorizontal || this.arrowDirectionVertical || null;
    },
  },
  methods: {
    widthChange(width: number) {
      this.currentCanvasWidth = width;
    },
  },
});
</script>
