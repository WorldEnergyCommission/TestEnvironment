<template>
  <div
    :class="[
      { online: status === true },
      { unknown: status === null },
      { offline: status === false },
      'status-indicator',
    ]"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * Component that represent StatusIndicator of the project
 * Used in AppBar.vue
 * Shows current mqtt connection
 */
export default defineComponent({
  props: {
    status: Boolean,
  },
});
</script>

<style lang="scss" scoped>
.status-indicator {
  width: 15px;
  height: 15px;
  border-radius: 50%;
}

.offline {
  background: red;
}

.online {
  background: green;
}

.unknown {
  background: grey;
}
</style>
