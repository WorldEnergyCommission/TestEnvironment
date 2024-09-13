<template>
  <v-combobox ref="coreCombobox" v-bind="$attrs" color="accent" variant="outlined">
    <template v-if="$slots.prepend" #prepend="prependProps">
      <slot name="prepend" v-bind="prependProps" />
    </template>
    <template v-if="$slots.item" #item="itemProps">
      <slot name="item" v-bind="itemProps" />
    </template>
    <template v-if="$slots.selection" #selection="selectionProps">
      <slot name="selection" v-bind="selectionProps" />
    </template>
  </v-combobox>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const coreCombobox = ref(null);
defineExpose({
  coreCombobox,
});
</script>

<style lang="scss" scoped></style>
