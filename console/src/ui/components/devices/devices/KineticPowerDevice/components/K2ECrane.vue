<template>
  <v-layer ref="layer" :config="layerOptions">
    <v-rect ref="rect" :config="fullCraneOptions" />
    <v-group
      ref="group"
      :config="{
        width: fullCraneOptions.width,
        height: fullCraneOptions.height,
        x: fullCraneOptions.x,
        y: fullCraneOptions.y,
      }"
    >
      <slot />
    </v-group>
  </v-layer>
</template>

<script lang="ts">
import Konva from "konva";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    craneOptions: Object as PropType<any>,
    layerOptions: Object as PropType<any>,
  },
  data() {
    const anim: any = null;
    const animXPosition: any = null;

    return {
      animXPosition,
      anim,
    };
  },
  computed: {
    actualXPosition() {
      return this.craneOptions?.x;
    },
    fullCraneOptions() {
      const { width, height, fill, stroke, offsetX, y } = this.craneOptions;
      return { width, height, fill, stroke, offsetX, y, x: this.animXPosition };
    },
  },
  watch: {
    actualXPosition: [
      {
        handler: "onXValueChange",
      },
    ],
  },
  mounted() {
    this.animXPosition = this.actualXPosition;
  },
  beforeUnmount() {
    this.cleanAnimation();
  },
  methods: {
    handleEndAnimation(currentPosition: any, finalPosition: any, direction: any) {
      if (direction === "right") {
        if (currentPosition > finalPosition) {
          this.anim.stop();
          this.animXPosition = finalPosition;
        }
      }
      if (direction === "left") {
        if (currentPosition < finalPosition) {
          this.anim.stop();
          this.animXPosition = finalPosition;
        }
      }
    },
    craneMovement(end: any, start: any, direction: any) {
      this.cleanAnimation();

      const layer: any = (this.$refs.layer as any).getNode();
      const rect: any = (this.$refs.rect as any).getNode();
      const group: any = (this.$refs.group as any).getNode();
      this.animXPosition = start;

      const run = (frame: any) => {
        const speed = frame.time * 0.008;

        if (direction === "right") this.animXPosition += speed;
        if (direction === "left") this.animXPosition -= speed;

        rect.setX(this.animXPosition);
        group.setX(this.animXPosition);

        this.handleEndAnimation(this.animXPosition, end, direction);
      };
      this.anim = new Konva.Animation(run, layer.getLayer());
      this.anim.start();
    },
    cleanAnimation() {
      if (this.anim) {
        this.anim.stop();
        this.anim = null;
      }
    },
    onXValueChange(current: any, prev: any) {
      if (current > prev) this.craneMovement(current, prev, "right");
      if (current < prev) this.craneMovement(current, prev, "left");
    },
  },
});
</script>

<style></style>
