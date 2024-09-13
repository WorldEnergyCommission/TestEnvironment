<template>
  <v-data-table v-bind="$attrs">
    <template v-for="(_, slotName) in $slots" #[slotName]="{ item, items, internalItem }">
      <slot :name="slotName" :items="items" :item="item" :internal-item="internalItem" />
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreDataTable",
});
</script>

<style lang="scss" scoped></style>
