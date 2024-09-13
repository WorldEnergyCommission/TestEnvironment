<template>
  <v-breadcrumbs :items="items" v-bind="$attrs">
    <template v-if="$slots.item" #item="{ item }">
      <slot name="item" :item="item" />
    </template>
    <template v-if="$slots.divider" #divider>
      <slot name="divider" />
    </template>
  </v-breadcrumbs>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";

export default defineComponent({
  name: "CoreBreadcrumbs",
  props: {
    items: {
      type: Object as PropType<any>,
    },
  },
});
</script>

<style lang="scss" scoped></style>
