<template>
  <v-expansion-panel v-bind="$attrs" elevation="0">
    <slot />
  </v-expansion-panel>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreExpansionPanel",
});
</script>

<style lang="scss" scoped></style>
