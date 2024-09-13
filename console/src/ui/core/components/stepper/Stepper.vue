<template>
  <v-stepper v-bind="$attrs" elevation="0">
    <slot />
  </v-stepper>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreStepper",
});
</script>

<style lang="scss" scoped></style>
