<template>
  <v-row v-bind="$attrs">
    <slot />
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreRow",
});
</script>

<style lang="scss" scoped></style>
