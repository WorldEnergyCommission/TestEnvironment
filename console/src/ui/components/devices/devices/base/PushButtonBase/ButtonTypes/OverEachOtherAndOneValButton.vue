<template>
  <CoreButton
    :color="!$vuetify.theme.current.dark ? buttonColor : '#424242'"
    :disabled="state"
    :height="buttonHeight"
    :width="buttonWidth"
    @mousedown="$emit('sendSingleValue')"
  >
    <span class="d-flex flex-column">
      <lynus-icon :color="!currentState ? iconColor : 'theme'" :name="icon" :size="iconSize" />
      <slot name="buttonText" />
    </span>
  </CoreButton>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

/**
 * Component that represent OverEachOtherAndOneValButton type for PushButton base control
 */
export default defineComponent({
  props: {
    currentState: { default: null, type: Object as PropType<number | null> },
    buttonWidth: { default: 150, type: Number },
    buttonHeight: { default: 36, type: Number },
    iconColor: { default: "theme", type: String },
    iconSize: { default: null, type: [Number, String] },
    buttonColor: { default: "white", type: String },
  },
});
</script>

<style lang="scss" scoped></style>
