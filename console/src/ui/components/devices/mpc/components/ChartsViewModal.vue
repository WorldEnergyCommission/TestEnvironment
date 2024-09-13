<template>
  <FormModal :form-title="modalTitle">
    <template #activator>
      <div class="w-100 h-100 d-flex align-center justify-center">
        <CoreTooltip location="bottom">
          <template #activator="{ props }">
            <CoreButton button-type="standardIcon" :size="buttonSizeClass" v-bind="props">
              <CoreIcon size="x-large"> fas fa-chart-line </CoreIcon>
            </CoreButton>
          </template>
          <span>{{ $t("mlModel.EMS.charts.tooltip") }}</span>
        </CoreTooltip>
      </div>
    </template>
    <template #content>
      <slot name="content" />
    </template>
  </FormModal>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import FormModal from "@/ui/components/modals/FormModal.vue";

/**
 * Component that represent chart.
 */
export default defineComponent({
  components: {
    FormModal,
  },
  props: {
    windowWidth: { default: "1200", type: [String, Number] },
    modalTitle: { default: "Charts", type: String },
    /** vuetify button size class */
    buttonSizeClass: {
      default: null,
      validator: (value: any): boolean =>
        [null, "x-small", "small", "large", "x-large"].some((el: string | null) => el === value),
      type: String,
    },
  },
  data() {
    return {};
  },
});
</script>
