<template>
  <div v-if="point" class="animated-line-canvas" @click.stop.prevent>
    <canvas ref="canvas" :height="size.height" :width="size.width" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import { useTheme } from "vuetify/lib/framework.mjs";

import {
  Point,
  Size,
  calculatePoints,
} from "@/ui/components/devices/components/EnergyParts/AnimatedLine/LineUtils";

export default defineComponent({
  props: {
    point: { default: null, type: Object as PropType<Point> },
    size: { default: null, type: Object as PropType<Size> },
    center: { default: null, type: Object as PropType<Point> },
  },
  setup() {
    const canvas = ref(null);
    return { canvas };
  },
  data() {
    const ctx = null as CanvasRenderingContext2D | null;
    const { current: theme } = useTheme();

    return {
      ctx,
      theme,
    };
  },
  watch: {
    theme: [{ handler: "pointWatcher" }],
    point: [{ deep: true, handler: "pointWatcher" }],
    size: [{ deep: true, handler: "pointWatcher" }],
    center: [{ deep: true, handler: "pointWatcher" }],
  },
  mounted() {
    this.redraw();
  },
  beforeUnmount() {
    this.ctx?.reset();
    this.ctx = null;
  },
  methods: {
    getOffset(start: number, end: number, circleRadius: number) {
      return start !== end ? (start < end ? circleRadius * -1 : circleRadius) : 0;
    },
    getSpaceBetweenCircles(
      start1: number,
      end1: number,
      start2: number,
      end2: number,
      space: number,
    ) {
      return start1 === end1 ? (start2 < end2 ? space * -1 : space) : 0;
    },
    drawOpenLine(ctx: CanvasRenderingContext2D, center: Point, point: Point) {
      const points = calculatePoints(center, point, false, this.$vuetify.display.mobile);
      const space = this.$vuetify.display.mobile ? 10 : 20;

      const spaceOnY = this.getSpaceBetweenCircles(
        points[0].x,
        points[points.length - 1].x,
        points[0].y,
        points[points.length - 1].y,
        space,
      );
      const spaceOnX = this.getSpaceBetweenCircles(
        points[0].y,
        points[points.length - 1].y,
        points[0].x,
        points[points.length - 1].x,
        space,
      );

      const first = {
        start: points[0],
        end: { x: points[1].x + spaceOnX, y: points[1].y + spaceOnY },
      };

      const circleRadius = this.$vuetify.display.mobile ? 3 : 5;

      let offsetX = this.getOffset(first.start.x, first.end.x, circleRadius);
      let offsetY = this.getOffset(first.start.y, first.end.y, circleRadius);

      // Draw the first line
      ctx.beginPath();
      ctx.moveTo(first.start.x, first.start.y);
      ctx.lineTo(first.end.x + offsetX, first.end.y + offsetY);
      const color = this.theme.colors.lynusText + "20";
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw a circle at the end of the first line
      ctx.beginPath();
      ctx.arc(first.end.x, first.end.y, circleRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.stroke();

      const second = {
        start: points[points.length - 2],
        end: points[points.length - 1],
      };

      // Draw a second circle (point attached line end)
      ctx.beginPath();
      ctx.arc(second.start.x, second.start.y, circleRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.stroke();

      offsetX = this.getOffset(second.end.x, second.start.x, circleRadius);
      offsetY = this.getOffset(second.end.y, second.start.y, circleRadius);

      // Draw the second line (from circle to point)
      ctx.beginPath();
      ctx.moveTo(second.start.x + offsetX, second.start.y + offsetY);
      ctx.lineTo(second.end.x, second.end.y);
      ctx.strokeStyle = color;
      ctx.stroke();

      ctx.closePath();
    },
    redraw() {
      // gets line canvas context object
      if (!this.point || !this.center || !this.size) return;
      if (!this.canvas) {
        return;
      }
      this.ctx = (this.canvas as HTMLCanvasElement).getContext("2d");
      if (!this.ctx) {
        return;
      }
      this.ctx.clearRect(
        0,
        0,
        (this.canvas as HTMLCanvasElement).width,
        (this.canvas as HTMLCanvasElement).height,
      );

      this.drawOpenLine(this.ctx, this.center, this.point);
    },
    async pointWatcher() {
      await this.$nextTick();
      this.redraw();
    },
  },
});
</script>

<style>
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
