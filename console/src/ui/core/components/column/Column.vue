<template>
  <v-col v-bind="$attrs">
    <slot />
  </v-col>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreColumn",
});
</script>

<style lang="scss" scoped></style>
