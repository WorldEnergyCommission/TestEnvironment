<template>
  <v-pagination v-bind="$attrs" color="accent">
    <slot />
  </v-pagination>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CorePagination",
});
</script>

<style lang="scss" scoped></style>
