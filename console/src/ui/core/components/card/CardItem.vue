<template>
  <v-card-item v-bind="$attrs">
    <slot />
    <template v-if="$slots.title" #title>
      <slot name="title" />
    </template>
    <template v-if="$slots.subtitle" #subtitle>
      <slot name="subtitle" />
    </template>
    <template v-if="$slots.default" #default>
      <slot name="default" />
    </template>
  </v-card-item>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreCardItem",
});
</script>

<style lang="scss" scoped></style>
