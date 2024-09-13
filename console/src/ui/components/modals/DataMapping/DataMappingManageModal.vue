<template>
  <EfficientIODialog :dialog-title="$t('uiComponents.library')">
    <template #activator>
      <CoreButton button-type="standardIcon" icon-name="settings" />
    </template>
    <template #content="{ hide, isActive }">
      <CoreContainer v-if="isActive" dense>
        <DataMappingForm
          :type="{ id: dataMapping.type_id, name: dataMapping.type }"
          :current-name="dataMapping.name"
          :current-mappings="dataMapping.mappings"
          :current-i-d="dataMapping.id"
          :edit-existing-data-mapping="true"
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
import { DataMapping } from "@/store/modules/dataMappings/types";
import DataMappingForm from "@/ui/components/forms/DataMappings/DataMappingForm.vue";
import EfficientIODialog from "@/ui/components/modals/EfficientIODialog.vue";

const props = defineProps<{ dataMapping: DataMapping }>();
</script>
