<template>
  <v-table v-bind="$attrs">
    <slot />
  </v-table>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreTable",
});
</script>

<style lang="scss">
.v-table {
  background-color: transparent;
}
</style>
