<template>
  <v-card-text v-bind="$attrs">
    <slot />
  </v-card-text>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreCardText",
});
</script>

<style lang="scss" scoped></style>
