<template>
  <v-list-item v-bind="$attrs">
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend" />
    </template>
    <slot />
    <template v-if="$slots.append" #append>
      <slot name="append" />
    </template>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreListItem",
});
</script>

<style lang="scss" scoped></style>
