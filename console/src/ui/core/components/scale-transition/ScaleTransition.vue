<template>
  <v-scale-transition v-bind="$attrs">
    <slot />
  </v-scale-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreScaleTransition",
});
</script>

<style lang="scss" scoped></style>
