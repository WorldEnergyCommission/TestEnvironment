<template>
  <div v-if="point" class="animated-line-canvas" @click.stop.prevent>
    <svg style="position: absolute; left: 0px" :height="size.height" :width="size.width">
      <path
        :d="path"
        :stroke-width="lineWidth"
        :stroke="theme.colors.lynusText + '20'"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      <circle
        :r="isLineActive ? lineWidth / 2 + 1 : 0"
        :fill="theme.colors.lynusText"
        :stroke="theme.colors.lynusText + '50'"
        stroke-width="2"
      >
        <animateMotion
          :dur="movementDuration"
          repeatCount="indefinite"
          :path="path"
          restart="always"
        />
      </circle>
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useTheme } from "vuetify/lib/framework.mjs";

import {
  Point,
  Size,
  calculatePoints,
  getPathForMovingObject,
} from "@/ui/components/devices/components/EnergyParts/AnimatedLine/LineUtils";

export type AnimatedLineBaseProps = {
  center: Point;
  point: Point;
  size: Size;
};

/**
 * Component that represent Animated line.
 * Used in EMS, EnergyView device.
 */
export default defineComponent({
  name: "AnimatedLine",
  props: {
    point: { default: null, type: Object as PropType<Point> },
    size: { default: null, type: Object as PropType<Size> },
    center: { default: null, type: Object as PropType<Point> },
    fromPointToCenter: { default: false, type: [Boolean, Number] },
    isLineActive: { default: true, type: Boolean },
    color1: { default: "#2BAAE2", type: String },
    color2: { default: "#525252", type: String },
    lineWidth: { default: 2, type: Number },
    pointsInOneLine: { default: false, type: Boolean },
  },
  setup() {
    const { current: theme } = useTheme();
    return { theme };
  },
  data() {
    const path = "";
    const movementDuration = "0s";

    return {
      path,
      movementDuration,
    };
  },
  watch: {
    theme: [{ handler: "redraw" }],
    point: [{ deep: true, handler: "redraw" }],
    size: [{ deep: true, handler: "redraw" }],
    center: [{ deep: true, handler: "redraw" }],
    fromPointToCenter: [
      {
        handler: "redraw",
      },
    ],
    isLineActive: [
      {
        handler: "redraw",
      },
    ],
  },
  mounted() {
    this.redraw();
  },
  methods: {
    /**
     * Draw path from start to end
     * @param {number} x1 start x position
     * @param {number} y1 start y position
     * @param {number} x2 end x position
     * @param {number} y2 end y position
     * @param {boolean} flipped is start and end flipped
     */
    draw(x1: number, y1: number, x2: number, y2: number, flipped: boolean) {
      this.movementDuration = this.isLineActive ? 14 - this.lineWidth + "s" : "0s";
      const points = calculatePoints(
        { x: x1, y: y1 },
        { x: x2, y: y2 },
        flipped,
        this.$vuetify.display.mobile,
        this.pointsInOneLine,
      );
      this.path = getPathForMovingObject(points, flipped);
    },
    redraw() {
      this.draw(
        this.fromPointToCenter ? this.point.x : this.center.x,
        this.fromPointToCenter ? this.point.y : this.center.y,
        this.fromPointToCenter ? this.center.x : this.point.x,
        this.fromPointToCenter ? this.center.y : this.point.y,
        this.fromPointToCenter as boolean,
      );
    },
  },
});
</script>

<style lang="scss" scoped>
.animated-line-canvas {
  cursor: default;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;

  canvas {
    max-width: 100%;
  }
}
</style>
