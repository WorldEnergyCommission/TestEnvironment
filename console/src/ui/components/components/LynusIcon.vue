<template>
  <span
    v-if="!isCustomLib(name)"
    :class="[
      'lynus-icon',
      `icon-${name}`,
      scaleClass,
      `icon-color-class-${color}`,
      { 'icon-animation': animation },
    ]"
    :style="sizeValue"
  />
  <CoreIcon v-else :color="color" :icon="`fas ${name}`" :size="size" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { isCustomLib } from "@/utils/utilsFunctions";

/**
 * Component that represent Lynus icon custom library
 * List off icons placed in public/icons.css
 */
export default defineComponent({
  props: {
    name: { default: "", type: String },
    scale: { default: "md", type: String },
    size: [Number, String],
    color: { default: null, type: String },
    animation: { default: false, type: [Boolean, String] },
  },
  computed: {
    scaleClass() {
      return this.scale && !this.size ? `icon-size-${this.scale}` : null;
    },
    sizeValue() {
      return this.size ? `font-size: ${this.size}px` : undefined;
    },
  },
  methods: {
    isCustomLib(icon: string) {
      return isCustomLib(icon);
    },
  },
});
</script>

<style lang="scss" scoped>
// animation
.icon-animation:before {
  animation: eye 3s linear infinite !important;
}

@keyframes eye {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

// sizes classes
.icon-size-md {
  font-size: 30px;
}

.icon-size-sm {
  font-size: 20px;
}

.icon-size-lg {
  font-size: 40px;
}

// color classes
.icon-color-class-red:before {
  color: rgb(var(--v-theme-error)) !important;
}

.icon-color-class-green:before {
  color: rgb(48, 191, 84) !important;
}

.icon-color-class-white:before {
  color: #ffffff !important;
}

.icon-color-class-black:before {
  color: #000000 !important;
}

.icon-color-class-accent:before {
  color: rgb(var(--v-theme-accent)) !important;
}

.icon-color-class-lynusText:before {
  color: rgb(var(--v-theme-lynusText)) !important;
}

.icon-color-class-theme:before {
  color: rgb(var(--v-theme-lynusIcon)) !important;
}

.icon-color-class-on-accent:before {
  color: rgb(var(--v-theme-on-accent)) !important;
}

.icon-color-class-warning:before {
  color: #dfc313 !important;
}
.icon-color-class-grey:before {
  color: grey !important;
}
</style>
