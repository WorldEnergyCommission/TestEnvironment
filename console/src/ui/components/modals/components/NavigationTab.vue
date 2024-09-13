<template>
  <CoreButton
    :class="['navigation-mapping-tab', { 'navigation-mapping-tab-active': isActive }]"
    :color="color"
    button-type="terciary"
    v-bind="$attrs"
  >
    {{ tabTitle }}
  </CoreButton>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * Navigation tab component, used in manage modals form for navigation
 */
export default defineComponent({
  props: {
    tabTitle: { default: "", type: String },
    isActive: { default: false, type: Boolean },
    color: { default: "accent", type: String },
  },
});
</script>

<style lang="scss" scoped>
.navigation-mapping-tab {
  opacity: 0.7;
}

.navigation-mapping-tab-active {
  opacity: 1;
}
</style>
