<template>
  <CoreDialog v-model="dialog" :max-width="modalWidth" persistent>
    <template #activator="{ props }">
      <span
        v-bind="props"
        class="form-overview"
        @click="handleDialog"
        @keydown.enter="handleDialog"
      >
        <slot name="activator" />
      </span>
    </template>
    <div v-if="dialog">
      <div class="efficientio-dialog-form">
        <DialogHeader :title="formTitle" @click="dialog = false" />
        <CoreCard
          :style="
            fullHeight
              ? 'height: calc(100dvh - 80px);'
              : defaultHeight
                ? ''
                : 'min-height: min(500px, calc(100dvh - 80px));'
          "
          class="efficientio-dialog-form-content curved-display-margin-bottom curved-display-padding-bottom"
          style="overflow-y: auto"
          card-with-bg-color
        >
          <slot name="content" :hide="() => (dialog = false)" :is-active="dialog" />
        </CoreCard>
      </div>
    </div>
  </CoreDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import DialogHeader from "@/ui/components/modals/components/DialogHeader.vue";

/**
 * A Dialog COmponenet for forms
 */
export default defineComponent({
  components: { DialogHeader },
  props: {
    formTitle: { default: "EfficientIO Modal", type: String },
    fullHeight: { default: false, type: Boolean },
    defaultHeight: { default: false, type: Boolean },
    isCallContentClickEvent: { default: true, type: Boolean },
    modalWidth: { type: Number },
    modelValue: { default: false, type: Boolean },
  },
  emits: ["handleDialogChange"],
  data() {
    return {
      dialog: false,
    };
  },
  watch: {
    dialog: [
      {
        handler: "onDialogChange",
      },
    ],
    modelValue: [
      {
        handler: "onModelValueChange",
      },
    ],
  },
  methods: {
    onModelValueChange(val: boolean) {
      this.dialog = val;
    },
    handleDialog() {
      this.dialog = this.isCallContentClickEvent;
    },
    onDialogChange(val: boolean) {
      this.$emit("handleDialogChange", val);
    },
  },
});
</script>

<style lang="scss">
.form-overview {
  cursor: pointer;
}
</style>
