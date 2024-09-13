<template>
  <v-slide-y-reverse-transition v-bind="$attrs">
    <slot />
  </v-slide-y-reverse-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreSlideYReverseTransition",
});
</script>

<style lang="scss" scoped></style>
