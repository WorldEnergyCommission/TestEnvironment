<template>
  <v-radio-group v-bind="$attrs">
    <slot />
  </v-radio-group>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreRadioGroup",
});
</script>

<style lang="scss" scoped></style>
