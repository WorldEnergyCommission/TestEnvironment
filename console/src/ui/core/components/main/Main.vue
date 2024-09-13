<template>
  <v-main v-bind="$attrs">
    <slot />
  </v-main>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreMain",
});
</script>

<style lang="scss" scoped></style>
