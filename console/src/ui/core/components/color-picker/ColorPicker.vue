<template>
  <v-color-picker v-bind="$attrs" />
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";

export default defineComponent({
  name: "CoreColorPicker",
});
</script>

<style lang="scss" scoped></style>
