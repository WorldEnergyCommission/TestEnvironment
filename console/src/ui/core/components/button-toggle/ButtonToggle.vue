<template>
  <v-btn-toggle v-bind="$attrs" color="accent" density="compact">
    <slot />
  </v-btn-toggle>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreButtonToggle",
});
</script>

<style lang="scss" scoped></style>
