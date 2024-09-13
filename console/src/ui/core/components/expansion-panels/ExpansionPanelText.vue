<template>
  <v-expansion-panel-text v-bind="$attrs">
    <slot />
  </v-expansion-panel-text>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreExpansionPanelText",
});
</script>

<style lang="scss" scoped></style>
