<template>
  <v-chip v-bind="$attrs">
    <template v-if="$slots.default" #default>
      <slot v-if="$slots.default" />
    </template>
  </v-chip>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreChip",
});
</script>

<style lang="scss" scoped></style>
