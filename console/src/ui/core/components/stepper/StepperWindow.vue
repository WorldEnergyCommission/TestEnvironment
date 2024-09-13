<template>
  <v-stepper-window>
    <slot />
  </v-stepper-window>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";

export default defineComponent({
  name: "CoreStepperWindow",

  props: {
    classes: {
      type: Object as PropType<any>,
    },
  },
});
</script>

<style lang="scss" scoped>
.v-stepper-window {
  height: 100%;
}
</style>
