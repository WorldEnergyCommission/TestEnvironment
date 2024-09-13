<template>
  <v-card-actions v-bind="$attrs">
    <slot />
  </v-card-actions>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreCardActions",
});
</script>

<style lang="scss" scoped></style>
