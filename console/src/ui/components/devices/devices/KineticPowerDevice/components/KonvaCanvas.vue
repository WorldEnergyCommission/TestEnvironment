<template>
  <v-stage v-resize="onResize" :config="configKonva">
    <slot />
  </v-stage>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    height: { default: 50, type: Number },
  },
  data() {
    return {
      configKonva: {
        width: 300,
        height: this.height,
      },
    };
  },
  methods: {
    onResize(size: any) {
      const { width } = size;

      // calculate scale by which to rescale the canvas width
      const scale = width / this.configKonva.width;
      this.configKonva.width *= scale;

      this.$emit("onWidthChange", this.configKonva.width);
    },
  },
});
</script>

<style lang="scss" scoped></style>
