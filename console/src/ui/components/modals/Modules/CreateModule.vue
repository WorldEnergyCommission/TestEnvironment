<template>
  <EfficientIODialog :dialog-title="$t('uiComponents.library')">
    <template #activator>
      <CoreButton button-type="primary" :icon="$vuetify.display.mobile">
        <span v-if="!$vuetify.display.mobile">
          {{ $t("workbench.modules.modules.new") }}
        </span>
        <template #icon>
          <lynus-icon :size="20" color="accent" name="plus" />
        </template>
      </CoreButton>
    </template>
    <template #content="{ hide, isActive }">
      <CoreContainer v-if="isActive" dense>
        <CreateModuleStepper
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

import CreateModuleStepper from "@/ui/components/forms/Modules/CreateModuleStepper.vue";
import EfficientIODialog from "@/ui/components/modals/EfficientIODialog.vue";

export default defineComponent({
  components: {
    EfficientIODialog,
    CreateModuleStepper,
  },
});
</script>
