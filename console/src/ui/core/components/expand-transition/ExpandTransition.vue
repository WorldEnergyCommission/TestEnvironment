<template>
  <v-expand-transition v-bind="$attrs">
    <slot />
  </v-expand-transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreExpandTransition",
});
</script>

<style lang="scss" scoped></style>
