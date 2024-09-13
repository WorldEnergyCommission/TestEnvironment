<template>
  <v-skeleton-loader v-bind="$attrs">
    <slot />
  </v-skeleton-loader>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreSkeletonLoader",
});
</script>

<style lang="scss" scoped></style>
