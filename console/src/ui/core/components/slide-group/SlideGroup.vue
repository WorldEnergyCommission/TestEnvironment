<template>
  <v-slide-group v-bind="$attrs">
    <slot />
  </v-slide-group>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreSlideGroup",
});
</script>

<style lang="scss" scoped></style>
