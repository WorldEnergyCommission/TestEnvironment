<template>
  <v-overlay v-bind="$attrs">
    <slot />
  </v-overlay>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreOverlay",
});
</script>

<style lang="scss" scoped></style>
