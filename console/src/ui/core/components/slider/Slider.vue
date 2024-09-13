<template>
  <v-slider v-bind="$attrs" color="accent">
    <template #thumb-label>
      <slot name="thumb-label" />
    </template>
  </v-slider>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreSlider",
});
</script>

<style lang="scss" scoped></style>
