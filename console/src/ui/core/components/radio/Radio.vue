<template>
  <v-radio v-bind="$attrs" color="accent">
    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
  </v-radio>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreRadio",
});
</script>

<style lang="scss" scoped></style>
