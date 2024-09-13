<template>
  <v-select ref="coreSelect" v-bind="$attrs" color="accent" variant="outlined" />
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "CoreSelect",
});
</script>
<script lang="ts" setup>
import { ref } from "vue";

const coreSelect = ref(null);
defineExpose({
  coreSelect,
});
</script>

<style lang="scss" scoped></style>
