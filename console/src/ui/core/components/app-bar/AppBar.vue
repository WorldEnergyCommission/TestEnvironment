<template>
  <v-app-bar v-bind="$attrs">
    <slot />
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreAppBar",
});
</script>

<style lang="scss" scoped></style>
