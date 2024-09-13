<template>
  <CoreButton
    :color="!$vuetify.theme.current.dark ? buttonColor : '#424242'"
    :disabled="currentState"
    :height="buttonHeight"
    :width="buttonWidth"
    @mousedown="$emit('playPauseUp')"
  >
    <span>
      <lynus-icon
        :color="!currentState ? iconColor : 'theme'"
        :name="playPauseIcon.icon"
        :size="iconSize"
      />
      <span>{{ playPauseIcon.text }}</span>
    </span>
  </CoreButton>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

/**
 * Component that represent PlayPauseIconAndTextButton type for PushButton base control
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
  computed: {
    playPauseIcon() {
      const isValid: boolean = this.currentState === 0 || this.currentState === -1;
      return isValid
        ? {
            icon: "ronova_pause",
            text: "Anhalten",
          }
        : {
            icon: "ronova_play",
            text: "Fortsetzen",
          };
    },
  },
});
</script>

<style lang="scss" scoped></style>
