<template>
  <v-slide-y-transition v-bind="$attrs">
    <slot />
  </v-slide-y-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreSlideYTransition",
});
</script>

<style lang="scss" scoped></style>
