<template>
  <v-sheet v-bind="$attrs">
    <slot />
  </v-sheet>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreSheet",
});
</script>

<style lang="scss" scoped></style>
