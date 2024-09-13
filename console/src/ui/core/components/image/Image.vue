<template>
  <v-img v-bind="$attrs">
    <template #placeholder>
      <slot v-if="$slots.placeholder" name="placeholder" />
    </template>
    <template #error>
      <slot v-if="$slots.error" name="error" />
    </template>
  </v-img>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreImage",
});
</script>

<style lang="scss" scoped></style>
