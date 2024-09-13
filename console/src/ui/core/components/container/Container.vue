<template>
  <v-container v-bind="$attrs">
    <slot />
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreContainer",
});
</script>

<style lang="scss" scoped></style>
