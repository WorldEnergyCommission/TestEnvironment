<template>
  <EfficientIODialog :dialog-title="$t('uiComponents.library')">
    <template #activator>
      <CoreButton button-type="primary" :icon="$vuetify.display.mobile" icon-name="plus">
        <span v-if="!$vuetify.display.mobile">
          {{ $t("workbench.modules.dataMappings.new") }}
        </span>
      </CoreButton>
    </template>
    <template #content="{ hide, isActive }">
      <CoreContainer v-if="isActive" dense>
        <DataMappingCreateStepper
          @dismiss="
            () => {
              hide();
              $emit('done');
            }
          "
        />
      </CoreContainer>
    </template>
  </EfficientIODialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import DataMappingCreateStepper from "@/ui/components/forms/DataMappings/DataMappingCreateStepper.vue";
import EfficientIODialog from "@/ui/components/modals/EfficientIODialog.vue";

export default defineComponent({
  components: {
    EfficientIODialog,
    DataMappingCreateStepper,
  },
});
</script>
