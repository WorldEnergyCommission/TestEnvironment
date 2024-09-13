<template>
  <CoreStepper
    :model-value="modelValue"
    class="d-flex flex-column h-100"
    style="height: 100%; margin-bottom: 0px"
    @update:model-value="$emit('update:modelValue', $event.target.value)"
  >
    <slot />
  </CoreStepper>
</template>

<script lang="ts">
export default {
  props: ["modelValue"],
  emits: ["update:modelValue"],
};
</script>
