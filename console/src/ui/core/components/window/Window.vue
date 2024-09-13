<template>
  <v-window v-bind="$attrs">
    <slot />
  </v-window>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreWindow",
});
</script>

<style lang="scss" scoped></style>
