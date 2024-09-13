<template>
  <v-slide-group-item v-bind="$attrs">
    <slot />
  </v-slide-group-item>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreSlideGroupItem",
});
</script>

<style lang="scss" scoped></style>
