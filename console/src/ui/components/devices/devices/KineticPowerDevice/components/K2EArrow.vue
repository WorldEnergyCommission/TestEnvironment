<template>
  <v-arrow :config="fullOptions" />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    arrowOptions: Object as PropType<any>,
    arrowDirection: Object as PropType<any>,
  },
  data() {
    return {
      localOptions: {
        stroke: "black",
        fill: "black",
        pointerLength: 0,
        pointerWidth: 0,
        points: [],
      },
      pointer: {
        pointerLength: 4,
        pointerWidth: 4,
      },
    };
  },
  computed: {
    arrowDirections() {
      const halfOfWidth: any = this.arrowOptions.width / 2;
      const halfOfHeight: any = this.arrowOptions.height / 2;
      return {
        left: {
          points: [halfOfWidth, halfOfHeight, 0, halfOfHeight],
          ...this.pointer,
        },
        right: {
          points: [halfOfWidth, halfOfHeight, this.arrowOptions.width, halfOfHeight],
          ...this.pointer,
        },
        up: {
          points: [halfOfWidth, halfOfHeight, halfOfWidth, 0],
          ...this.pointer,
        },
        down: {
          points: [halfOfWidth, halfOfHeight, halfOfWidth, this.arrowOptions.height],
          ...this.pointer,
        },
      };
    },
    fullOptions() {
      const { offsetX } = this.arrowOptions as any;
      const currentDirection = this.arrowDirection
        ? (this.arrowDirections as any)[this.arrowDirection]
        : { points: [0, 0, 0, 0] };
      return { ...this.localOptions, ...currentDirection, ...{ offsetX } };
    },
  },
});
</script>

<style lang="scss" scoped></style>
