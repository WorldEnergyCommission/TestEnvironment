<template>
  <div class="show-event-dot-base-http">
    <div
      :style="`background: ${warningState}; width: ${width}px; height: ${height}px`"
      class="show-event-dot-base-http-indicator"
    />
    <div v-if="activeMessage || inactiveMessage" class="show-event-dot-base-http-label pl-1">
      {{ state ? activeMessage : inactiveMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * Component that represent ShowEventDotBase component.
 */
export default defineComponent({
  props: {
    state: { default: false, type: Boolean },
    activeColor: { default: "#ff0000", type: String },
    inactiveColor: { default: "#bebebe", type: String },
    activeMessage: { default: null, type: String },
    inactiveMessage: { default: null, type: String },
    width: { default: 20, type: [String, Number] },
    height: { default: 20, type: [String, Number] },
  },
  computed: {
    warningState() {
      return this.state ? this.activeColor : this.inactiveColor;
    },
  },
});
</script>

<style lang="scss" scoped>
.show-event-dot-base-http {
  display: flex;

  .show-event-dot-base-http-indicator {
    border-radius: 50%;
  }
}
</style>
