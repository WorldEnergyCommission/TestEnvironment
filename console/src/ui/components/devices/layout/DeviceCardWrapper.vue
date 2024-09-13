<template>
  <CoreCard
    :class="['body', { cardWithBg: $slots.title }]"
    :elevated-card="$slots.title !== undefined"
    :card-with-bg-color="$slots.title !== undefined"
  >
    <div v-if="$slots.title" class="mb-2 text">
      <slot name="title" />
      <slot name="actions" />
    </div>
    <slot name="content" />
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "DeviceCardWrapper",
});
</script>

<style lang="scss" scoped>
@import "./src/ui/scss/variables";
.text {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  z-index: 3;
  word-break: break-word;
  line-height: 1;
}

.body {
  position: relative;
  overflow: auto;
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;

  &.cardWithBg {
    padding-top: 20px;
    padding: 15px;
    padding-right: 5px;

    @media all and (max-width: 1400px) {
      padding: 10px;
      padding-right: 0px;
    }
  }
}
</style>
