<template>
  <v-card-subtitle v-bind="$attrs">
    <slot />
  </v-card-subtitle>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreCardSubtitle",
});
</script>

<style lang="scss" scoped></style>
