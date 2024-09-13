<template>
  <v-footer v-bind="$attrs">
    <slot />
  </v-footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreFooter",
});
</script>

<style lang="scss" scoped></style>
