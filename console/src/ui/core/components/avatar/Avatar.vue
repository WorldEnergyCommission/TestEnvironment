<template>
  <v-avatar v-bind="$attrs">
    <slot />
  </v-avatar>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreAvatar",
});
</script>

<style lang="scss" scoped></style>
