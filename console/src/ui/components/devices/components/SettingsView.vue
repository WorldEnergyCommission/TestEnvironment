<template>
  <FormModal
    v-model="isSettingsView"
    :form-title="deviceData?.name"
    :max-width="modalWidth"
    @handle-dialog-change="onDialogChange"
  >
    <template #content>
      <slot name="content" />
    </template>
  </FormModal>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import FormModal from "@/ui/components/modals/FormModal.vue";

/**
 * Component that represent settings view for device, MPC
 */
export default defineComponent({
  components: {
    FormModal,
  },
  props: {
    modelValue: Boolean,
    deviceData: Object as PropType<IDevice>,
    modalWidth: { default: "600", type: [Number, String] },
  },
  emits: ["switchSettingsView", "update:modelValue"],
  computed: {
    isSettingsView: {
      get() {
        return this.modelValue;
      },
      set(val: boolean) {
        this.$emit("update:modelValue", val);
      },
    },
  },
  methods: {
    onDialogChange(val: boolean) {
      this.$emit("switchSettingsView", val);
    },
  },
});
</script>

<style lang="scss">
@import "../../../scss/variables";

.settings-view {
  background: transparent !important;

  .settings-view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .settings-view-title {
      font-size: 30px;
      color: rgb(var(--v-theme-accentLight));
      height: 40px;
      line-height: 1;
    }
  }

  .settings-view-body {
    background: rgb(var(--v-theme-deviceBackground));
    border-radius: $border-radius-root !important;
    padding: 20px;
    max-height: 80dvh;
    overflow: auto;
  }

  .v-text-field__slot {
    input {
      color: #525252 !important;
    }
  }
}
</style>
