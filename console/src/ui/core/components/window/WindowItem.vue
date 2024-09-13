<template>
  <v-window-item v-bind="$attrs">
    <slot />
  </v-window-item>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreWindowItem",
});
</script>

<style lang="scss" scoped></style>
