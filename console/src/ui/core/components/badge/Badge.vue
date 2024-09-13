<template>
  <v-badge v-bind="$attrs">
    <slot />
  </v-badge>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreBadge",
});
</script>

<style lang="scss" scoped></style>
