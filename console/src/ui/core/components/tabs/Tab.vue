<template>
  <v-tab v-bind="$attrs">
    <slot />
  </v-tab>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";

export default defineComponent({
  name: "CoreTab",
});
</script>

<style lang="scss" scoped></style>
