<template>
  <v-breadcrumbs-item v-bind="$attrs">
    <slot />
  </v-breadcrumbs-item>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreBreadcrumbItem",
});
</script>

<style lang="scss" scoped></style>
