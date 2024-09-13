<template>
  <v-tooltip v-bind="$attrs">
    <template #activator="{ props }">
      <slot name="activator" :props="props" />
    </template>
    <slot />
  </v-tooltip>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreTooltip",
});
</script>
