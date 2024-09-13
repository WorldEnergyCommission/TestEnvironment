<template>
  <v-form ref="coreForm" v-bind="$attrs">
    <slot />
  </v-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreForm",
});
</script>
<script lang="ts" setup>
import { ref } from "vue";

const coreForm = ref(null);
defineExpose({
  coreForm,
});
</script>

<style lang="scss" scoped></style>
