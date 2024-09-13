<template>
  <v-icon v-bind="$attrs">
    <slot />
  </v-icon>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreIcon",
});
</script>

<style lang="scss" scoped></style>
