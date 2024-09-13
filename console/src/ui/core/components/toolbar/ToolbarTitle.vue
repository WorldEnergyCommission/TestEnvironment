<template>
  <v-toolbar-title v-bind="$attrs">
    <slot />
  </v-toolbar-title>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreToolbarTitle",
});
</script>
