<template>
  <v-progress-linear v-bind="$attrs">
    <slot />
  </v-progress-linear>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreProgressLinear",
});
</script>

<style lang="scss" scoped></style>
