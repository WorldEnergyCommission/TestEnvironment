<template>
  <v-toolbar v-bind="$attrs" color="surface">
    <slot />
  </v-toolbar>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreToolbar",
});
</script>
