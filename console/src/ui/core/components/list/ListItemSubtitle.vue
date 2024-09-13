<template>
  <v-list-item-subtitle v-bind="$attrs">
    <slot />
  </v-list-item-subtitle>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreListItemSubtitle",
});
</script>

<style lang="scss" scoped></style>
