<template>
  <v-navigation-drawer v-bind="$attrs">
    <template #prepend>
      <slot name="prepend" />
    </template>
    <slot />
    <template #append>
      <slot name="append" />
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreNavigationDrawer",
});
</script>

<style lang="scss" scoped></style>
