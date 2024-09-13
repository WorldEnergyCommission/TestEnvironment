<template>
  <v-app v-bind="$attrs">
    <slot />
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreApp",
});
</script>

<style lang="scss" scoped></style>
