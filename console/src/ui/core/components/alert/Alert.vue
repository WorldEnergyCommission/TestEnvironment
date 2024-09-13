<template>
  <v-alert v-bind="$attrs">
    <slot />
  </v-alert>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreAlert",
});
</script>

<style lang="scss" scoped></style>
