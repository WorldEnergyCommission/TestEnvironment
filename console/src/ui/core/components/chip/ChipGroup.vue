<template>
  <v-chip-group v-bind="$attrs">
    <slot />
  </v-chip-group>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreChipGroup",
});
</script>

<style lang="scss" scoped></style>
