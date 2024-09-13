<template>
  <v-list-item-title v-bind="$attrs">
    <slot />
  </v-list-item-title>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreListItemTitle",
});
</script>

<style lang="scss" scoped></style>
