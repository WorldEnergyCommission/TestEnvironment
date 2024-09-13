<template>
  <v-stepper-item v-bind="$attrs">
    <slot />
  </v-stepper-item>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreStepperHeaderItem",
});
</script>

<style lang="scss" scoped></style>
