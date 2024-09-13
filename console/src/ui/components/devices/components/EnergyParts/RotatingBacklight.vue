<template>
  <div
    :class="['ems-preview', 'rotating-backlight', { 'rotating-backlight-disabled': noData }]"
    :style="`background-image: linear-gradient(var(--angle), ${color}, transparent, transparent);`"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * Component that represent rotating backlight for Preview.vue, PreviewMQTTControls.vue
 */
export default defineComponent({
  props: {
    color: { default: "#dedede", type: String },
    noData: { default: false, type: Boolean },
  },
});
</script>

<style lang="scss" scoped>
@keyframes rotateBacklight {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes rotate {
  to {
    --angle: 360deg;
  }
}
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.rotating-backlight {
  position: absolute;
  --angle: 0deg;
  border-radius: 24px;
  background-image: linear-gradient(var(--angle), #12c2e9, transparent);
  animation: 5s rotate linear infinite;
  background-origin: border-box;
  background-clip: content-box, border-box;

  @media all and (max-width: 800px) {
    border-radius: 12px;
  }
}

.rotating-backlight-disabled {
  display: none;
}
</style>
