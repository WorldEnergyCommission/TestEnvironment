<template>
  <v-dialog v-bind="$attrs">
    <template #activator="{ props }">
      <span v-bind="props">
        <slot name="activator" :props="props" />
      </span>
    </template>
    <slot />
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreDialog",
});
</script>

<style lang="scss" scoped></style>
