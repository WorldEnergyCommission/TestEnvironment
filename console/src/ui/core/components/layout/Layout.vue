<template>
  <v-layout v-bind="$attrs">
    <slot />
  </v-layout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreLayout",
});
</script>

<style lang="scss" scoped></style>
