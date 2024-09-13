<template>
  <v-stepper-header v-bind="$attrs" elevation="0">
    <slot />
  </v-stepper-header>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreStepperHeader",
});
</script>

<style lang="scss" scoped>
.v-stepper-header {
  box-shadow: none;
}
</style>
