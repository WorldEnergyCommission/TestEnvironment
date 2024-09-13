<template>
  <CoreImage :max-height="maxHeight" :max-width="maxWidth" :src="src" alt="preview-image" />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

/**
 * Component that represent Preview Image
 */
export default defineComponent({
  props: {
    src: { default: "", type: String },
    maxWidth: Object as PropType<any>,
    maxHeight: Object as PropType<any>,
  },
});
</script>

<style lang="scss" scoped></style>
