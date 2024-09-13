<template>
  <CoreButton
    :height="buttonSize"
    :width="buttonSize"
    icon
    rounded
    @mousedown="$emit('down')"
    @mouseup="$emit('up')"
  >
    <lynus-icon :color="currentState ? 'white' : 'theme'" :name="icon" :size="iconSize" />
  </CoreButton>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

/**
 * Component that represent UpDownRoundedOnlyIconButton type for PushButton base control
 */
export default defineComponent({
  props: {
    currentState: { default: null, type: Object as PropType<number | null> },
    icon: { default: "push_button", type: String },
    buttonSize: { default: 40, type: [String, Number] },
    iconSize: { default: null, type: [Number, String] },
  },
});
</script>

<style lang="scss" scoped></style>
