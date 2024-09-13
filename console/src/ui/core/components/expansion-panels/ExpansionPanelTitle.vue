<template>
  <v-expansion-panel-title v-bind="$attrs">
    <slot />
  </v-expansion-panel-title>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreExpansionPanelTitle",
});
</script>

<style lang="scss" scoped></style>
