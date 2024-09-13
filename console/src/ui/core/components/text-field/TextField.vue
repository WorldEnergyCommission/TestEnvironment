<template>
  <v-text-field ref="coreTextField" v-bind="$attrs" color="accent" variant="outlined">
    <template #prepend-inner>
      <slot name="prepend-inner" />
    </template>
  </v-text-field>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "CoreTextField",
});
</script>
<script lang="ts" setup>
import { ref } from "vue";

const coreTextField = ref(null);
defineExpose({
  coreTextField,
});
</script>
<style lang="scss" scoped></style>
