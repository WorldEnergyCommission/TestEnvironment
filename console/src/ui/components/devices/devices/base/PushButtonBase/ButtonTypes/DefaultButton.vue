<template>
  <CoreButton
    :class="['push-button-base', { active: defaultButtonCurrentState }]"
    :disabled="isNotMapped"
    :height="buttonSize"
    :variant="true && 'outlined'"
    :width="buttonSize"
    icon
    @mousedown="$emit('down')"
    @mouseup="$emit('up')"
  >
    <lynus-icon
      :color="defaultButtonCurrentState ? 'white' : 'accent'"
      :name="icon"
      :size="iconSize"
    />
  </CoreButton>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

/**
 * Component that represent DefaultButton type for PushButton base control
 */
export default defineComponent({
  props: {
    defaultButtonCurrentState: {
      default: null,
      type: [Object as PropType<number | null>, Boolean],
    },
    isNotMapped: { default: false, type: Boolean },
    icon: { default: "push_button", type: String },
    buttonSize: { default: 40, type: [String, Number] },
    iconSize: { default: null, type: [Number, String] },
  },
});
</script>

<style lang="scss" scoped>
.push-button-base {
  background: transparent !important;
  border: 2px solid #c4c4c4;
}

.active {
  background: rgb(var(--v-theme-accent)) !important;
  border: 2px solid rgb(var(--v-theme-accent));
}
</style>
