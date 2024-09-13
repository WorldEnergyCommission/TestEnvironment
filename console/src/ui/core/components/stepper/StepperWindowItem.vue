<template>
  <v-stepper-window-item v-bind="$attrs">
    <slot />
  </v-stepper-window-item>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreStepperWindowItem",
});
</script>

<style lang="scss" scoped></style>
