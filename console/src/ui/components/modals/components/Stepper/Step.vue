<template>
  <CoreStepperWindowItem :value="step" :touch="false">
    <div class="d-flex flex-column h-100 justify-space-between">
      <div class="content overflow-auto h-100">
        <slot name="content" />
      </div>
      <slot name="footer" />
    </div>
  </CoreStepperWindowItem>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    step: { default: 1, type: Number },
  },
});
</script>

<style lang="scss" scoped>
.v-window-item {
  height: 100% !important;
}
</style>
