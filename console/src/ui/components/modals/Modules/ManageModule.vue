<template>
  <EfficientIODialog :dialog-title="$t('uiComponents.library')">
    <template #activator="{ props }">
      <div v-bind="props">
        <slot name="activator">
          <CoreButton button-type="standardIcon">
            <lynus-icon name="settings" size="20" />
          </CoreButton>
        </slot>
      </div>
    </template>
    <template #content="{ hide, isActive }">
      <CoreContainer v-if="isActive" dense>
        <ModuleForm
          :type="{ id: device.type_id, name: device.type }"
          :current-name="device.name"
          :current-mappings="device.properties"
          :current-i-d="device.id"
          :edit-existing-device="true"
          @finished="
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

<script lang="ts" setup>
import { ModuleType } from "@/store/modules/modules/types";
import ModuleForm from "@/ui/components/forms/Modules/ModuleForm.vue";
import EfficientIODialog from "@/ui/components/modals/EfficientIODialog.vue";

const props = defineProps<{
  device: ModuleType;
}>();
</script>
