<template>
  <v-autocomplete ref="coreAutocomplete" v-bind="$attrs" color="accent" variant="outlined">
    <template v-for="(_, slotName) in $slots" #[slotName]="{ item, props }">
      <slot :name="slotName" :props="props" :item="item" />
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreAutocomplete",
});
</script>
<script lang="ts" setup>
import { ref } from "vue";

const coreAutocomplete = ref(null);
defineExpose({
  coreAutocomplete,
});
</script>
<style lang="scss" scoped></style>
