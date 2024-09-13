<template>
  <v-snackbar v-bind="$attrs" variant="flat">
    <slot />
    <template v-if="$slots.actions" #actions>
      <slot name="actions" />
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreSnackbar",
});
</script>

<style lang="scss" scoped></style>
