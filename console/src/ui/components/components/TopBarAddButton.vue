<template>
  <CoreButton
    :disabled="disabled"
    button-type="primary"
    :icon="$vuetify.display.mobile"
    :size="buttonSize"
    icon-name="plus"
    :icon-size="getIconSize"
    @click="onClick($event)"
  >
    <span v-if="!$vuetify.display.mobile">
      {{ text }}
    </span>
  </CoreButton>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    iconSize: {
      type: String,
    },
    text: {
      type: String,
    },
    disabled: { default: false, type: Boolean },
  },
  emits: ["click"],
  computed: {
    /**
     * Define button size according to current display size
     * @return string vuetify button size class
     */
    buttonSize() {
      switch (this.$vuetify.display.name) {
        case "xs":
          return "x-small";
        case "sm":
          return "x-small";
        case "md":
          return "small";
        default:
          return undefined;
      }
    },
    /**
     * Define icon size according to current display size
     * @return number icon size
     */
    getIconSize() {
      if (this.iconSize && this.iconSize !== "") {
        return this.iconSize;
      }

      switch (this.$vuetify.display.name) {
        case "xs":
          return 20;
        case "sm":
          return 13;
        case "md":
          return 18;
        case "lg":
          return 20;
        case "xl":
          return 20;
        default:
          return 20;
      }
    },
  },
  methods: {
    onClick(event: Event) {
      this.$emit("click", event);

      return event;
    },
  },
});
</script>
