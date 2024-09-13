<template>
  <v-textarea ref="coreTextarea" v-bind="$attrs" color="accent" variant="outlined" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "CoreTextarea",
});
</script>
<script lang="ts" setup>
import { ref } from "vue";

const coreTextarea = ref(null);
defineExpose({
  coreTextarea,
});
</script>

<style lang="scss" scoped></style>
