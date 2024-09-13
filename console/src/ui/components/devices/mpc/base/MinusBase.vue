<template>
  <div>
    <CoreButton :color="color" :rounded="!fab" elevation="0" size="small" @click="handleMinus">
      <lynus-icon :name="icon" color="primary" size="24" />
    </CoreButton>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

/**
 * Component that represent MinusBase component
 */
export default defineComponent({
  props: {
    variableData: Object as PropType<any>,
    instance: {
      type: String,
    },
    color: { default: "accent", type: String },
    fab: { default: false, type: Boolean },
    icon: { default: "minus", type: String },
  },
  methods: {
    handleMinus() {
      this.$emit("handleMinus");
    },
  },
});
</script>

<style lang="scss" scoped></style>
