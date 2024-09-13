<template>
  <v-list v-bind="$attrs">
    <slot />
  </v-list>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreList",
});
</script>

<style lang="scss" scoped></style>
