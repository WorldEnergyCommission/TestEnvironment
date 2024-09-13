<template>
  <v-slide-x-transition v-bind="$attrs">
    <slot />
  </v-slide-x-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreSlideXTransition",
});
</script>

<style lang="scss" scoped></style>
