<template>
  <v-card-title v-bind="$attrs">
    <slot />
  </v-card-title>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreCardTitle",
});
</script>

<style lang="scss" scoped></style>
