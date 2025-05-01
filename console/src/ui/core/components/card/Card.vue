<template>
  <v-card
    v-bind="$attrs"
    flat
    :elevation="elevatedCard ? 1 : 0"
    :color="
      cardWithBgColor
        ? $vuetify.theme.current.dark
          ? 'primary-lighten-1'
          : 'secondaryDeviceBackground-lighten-1'
        : ''
    "
  >
    <slot />
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreCard",

  props: {
    elevatedCard: {
      default: false,
      type: Boolean,
    },
    cardWithBgColor: {
      default: false,
      type: Boolean,
    },
  },
});
</script>

<style lang="scss" scoped>
.v-card--link:before {
  background: transparent !important;
}

.v-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}
</style>
