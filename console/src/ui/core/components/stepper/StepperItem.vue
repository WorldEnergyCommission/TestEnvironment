<template>
  <v-stepper-item v-bind="$attrs" color="accent">
    <slot />
  </v-stepper-item>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreStepperItem",
});
</script>

<style lang="scss" scoped></style>
