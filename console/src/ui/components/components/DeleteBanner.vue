<template>
  <div class="delete-banner">
    <div class="text">
      {{ text }}
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    text: { default: "", type: String },
  },
});
</script>
<style lang="scss">
@import "./src/ui/scss/variables";

.delete-banner {
  height: 60px;
  width: 100%;
  background: #e83b3a33;
  border-radius: $border-radius-root;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;

  .text {
    color: #e83b3a;
    font-size: 20px;
    @media all and (max-width: 1366px) {
      font-size: 15px;
    }
  }
}
</style>
