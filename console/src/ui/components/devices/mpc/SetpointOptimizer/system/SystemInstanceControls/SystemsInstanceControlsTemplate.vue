<template>
  <CoreContainer>
    <CoreRow class="systems-instance-controls-template">
      <CoreColumn cols="12" md="6" class="left-side">
        <slot name="left-side" />
      </CoreColumn>
      <CoreColumn cols="12" md="6" class="right-side">
        <slot name="right-side" />
      </CoreColumn>
    </CoreRow>
  </CoreContainer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<style lang="scss"></style>
