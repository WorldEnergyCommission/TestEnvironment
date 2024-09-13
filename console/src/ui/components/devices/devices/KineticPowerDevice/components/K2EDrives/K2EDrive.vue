<template>
  <v-group>
    <v-arrow ref="drive" :config="fullDriveOptions" />
    <v-rect ref="rect" :config="rectOptions" />
  </v-group>
</template>

<script lang="ts">
import Konva from "konva";
import { defineComponent, PropType } from "vue";

import { RootState } from "@/store/types";

export default defineComponent({
  props: {
    driveData: Object as PropType<any>,
    drivePositionX: Object as PropType<any>,
    maxHeight: Object as PropType<any>,
    stepWidth: { default: 10, type: Number },
    rowHeight: { default: 15, type: Number },
  },
  data() {
    const anim: any = null;
    const animYPosition: any = null;
    const localDriveOptions: any = {
      stroke: "black",
      fill: "black",
      pointerLength: 4,
      pointerWidth: 4,
      points: [],
    };

    return {
      localDriveOptions,
      animYPosition,
      anim,
    };
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    measurements() {
      return this.measurementsState.measurements;
    },
    currentYPosition() {
      const val: any = this.measurements.get(this.driveData.positionY);
      const num = parseInt(val, 10);
      return num > 97 ? 97 : num;
    },
    currentYPositionAsPixels() {
      // determine the number from 100%
      const num: any = this.maxHeight * (this.currentYPosition / 100);
      // reverse the numerical order
      return this.maxHeight - num;
    },
    hasContainer() {
      const val: any = this.measurements.get(this.driveData.hasContainer);
      return parseInt(val, 10);
    },
    pointsObj() {
      return {
        points: [this.drivePositionX, 0, this.drivePositionX, this.animYPosition],
      };
    },
    fullDriveOptions() {
      return { ...this.localDriveOptions, ...this.pointsObj };
    },
    rectOptions() {
      if (!this.hasContainer) return {};
      return {
        width: this.stepWidth - 2,
        height: this.rowHeight,
        x: this.drivePositionX - this.stepWidth / 2 + 1,
        y: this.animYPosition,
        fill: this.$vuetify.theme.current.colors.accent,
      };
    },
  },
  watch: {
    currentYPositionAsPixels: [
      {
        handler: "onCurrentYPositionChange",
      },
    ],
  },
  mounted() {
    this.animYPosition = this.currentYPositionAsPixels;
  },
  beforeUnmount() {
    this.cleanAnimation();
  },
  methods: {
    handleEndAnimation(currentPosition: any, finalPosition: any, direction: any) {
      if (direction === "down") {
        if (currentPosition > finalPosition) {
          this.anim.stop();
          this.animYPosition = finalPosition;
        }
      }
      if (direction === "up") {
        if (currentPosition < finalPosition) {
          this.anim.stop();
          this.animYPosition = finalPosition;
        }
      }
    },
    driveMovement(end: any, start: any, direction: any) {
      this.cleanAnimation();

      const drive = (this.$refs.drive as any).getNode();
      const rect = (this.$refs.rect as any).getNode();
      this.animYPosition = start;

      const run = (frame: any) => {
        const speed: any = frame.time * 0.008;

        if (direction === "down") this.animYPosition += speed;
        if (direction === "up") this.animYPosition -= speed;

        drive.points([this.drivePositionX, 0, this.drivePositionX, this.animYPosition]);
        rect.setY(this.animYPosition);

        this.handleEndAnimation(this.animYPosition, end, direction);
      };
      this.anim = new Konva.Animation(run, drive.getLayer());
      this.anim.start();
    },
    cleanAnimation() {
      if (this.anim) {
        this.anim.stop();
        this.anim = null;
      }
    },
    onCurrentYPositionChange(current: any, prev: any) {
      if (current > prev) this.driveMovement(current, prev, "down");
      if (current < prev) this.driveMovement(current, prev, "up");
    },
  },
});
</script>

<style lang="scss" scoped></style>
