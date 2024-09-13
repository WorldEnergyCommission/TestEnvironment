<template>
  <v-expansion-panels>
    <slot />
  </v-expansion-panels>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreExpansionPanels",
});
</script>

<style lang="scss" scoped></style>
