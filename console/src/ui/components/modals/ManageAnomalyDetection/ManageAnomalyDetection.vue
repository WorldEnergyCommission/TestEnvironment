<template>
  <FormModal :form-title="formTitle" max-width="1750" @handle-dialog-change="onDialogChange">
    <template #activator>
      <slot />
    </template>
    <template #content>
      <div class="manage-anomaly-detection">
        <CoreContainer fluid class="manage-anomaly-detection-content h-100 py-0 px-0">
          <CoreRow class="h-100">
            <CoreColumn v-if="!deviceFormView" class="d-flex flex-column py-0 h-100">
              <!-- Device Type Field -->
              <div class="device-type-field">
                <CoreContainer class="w-75">
                  <CoreRow class="mb-10">
                    <CoreCombobox
                      v-model="deviceType"
                      :items="anomalyDetectionTypesWithLocaleNamesList"
                      :label="t('modals.manageMLModel.form.type')"
                      :style="deviceType && deviceType.value ? 'margin-top: 58px;' : ''"
                      cache-items
                      class="items-list-background"
                      hide-details
                      hide-selected
                      item-title="title"
                      item-value="value"
                    />
                  </CoreRow>
                  <CoreRow class="preview-image-size">
                    <!-- Preview Image -->
                    <PreviewImage
                      v-if="currentPreviewImage && !$vuetify.display.mobile"
                      :src="currentPreviewImage"
                    />
                  </CoreRow>
                </CoreContainer>
              </div>
              <CoreRow class="w-100">
                <CoreColumn class="d-flex align-end justify-end">
                  <!-- Next Button -->
                  <!-- Next Button -->
                  <FirstStepActions
                    :disable-next-button="!typeValidation"
                    :next-button-tool-tip="t('modals.manageDevice.tooltips.type')"
                    :hide-next-tool-tip="typeValidation"
                    @next="deviceFormView = true"
                  />
                </CoreColumn>
              </CoreRow>
            </CoreColumn>
            <!-- Schema -->
            <CoreColumn v-if="deviceFormView" class="py-0 h-100">
              <component
                :is="currentAnomalyDetectionType.manageSchema"
                :active-room-id="activeRoomId"
                :device-data="anomalyDetectionDataWithType"
                :is-edit-modal="!!deviceData.data.type"
                @back-to-choosing-type="deviceFormView = false"
                @close-dialog="closeDialog"
                @handle-control="(val) => emit('handleControl', val)"
              />
            </CoreColumn>
          </CoreRow>
        </CoreContainer>
      </div>
    </template>
  </FormModal>
</template>

<script setup lang="ts">
import { computed, defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";

import { usePreviewImage } from "@/composables/usePreviewImage";
import { IDevice } from "@/store/modules/devices/types";
import { RootState } from "@/store/types";
import PreviewImage from "@/ui/components/components/PreviewImage.vue";
import { FirstStepActions } from "@/ui/components/modals/components/Actions";
import FormModal from "@/ui/components/modals/FormModal.vue";
// eslint-disable-next-line import/order
import DefaultSchema from "@/ui/components/modals/ManageAnomalyDetection/schemas/DefaultSchema.vue";
import { useCommonDeviceModalState } from "@/ui/components/modals/utils";

// Properties
interface Props {
  formTitle: string;
  deviceData?: IDevice;
  activeRoomId: string;
}

const props = withDefaults(defineProps<Props>(), {
  formTitle: "",
  deviceData: {
    name: "",
    data: {
      type: "",
      meta: {},
    },
    collection_id: "",
  },
  activeRoomId: "",
});

// Constants
const { t } = useI18n();
const store = useStore();

// Emits
const emit = defineEmits<{
  (e: "handleControl", value: any): void;
  (e: "close"): void;
}>();
const {
  deviceType,
  dialog,
  deviceFormView,
  closeDialog,
  nameTypeValidation: typeValidation,
  onDialogChange,
} = useCommonDeviceModalState(props.deviceData, () => emit("close"));

const currentAnomalyDetectionType = computed(() => {
  if (deviceType.value.value) {
    return (store.state as RootState).anomalyDetection.anomalyDetectionTypes[
      deviceType.value.value
    ];
  }
  return {};
});

const anomalyDetectionDataWithType = computed(() => {
  const clone = JSON.parse(JSON.stringify(props.deviceData));
  clone.data.type = deviceType.value.value;
  return clone;
});

const anomalyDetectionTypesWithLocaleNamesList = computed(() => {
  return store.getters["anomalyDetection/anomalyDetectionTypesWithLocaleNamesList"];
});

const typeValue = computed(() => deviceType.value.value);
const { currentPreviewImage } = usePreviewImage(typeValue);
</script>

<script lang="ts">
// <component is=""> only really works with options api!?

export default defineComponent({
  components: {
    DefaultSchema,
  },
});
</script>

<style lang="scss">
@import "./src/ui/scss/variables";

.manage-anomaly-detection {
  height: 80dvh;
  display: flex;
  flex-direction: column;

  .manage-anomaly-detection-content {
    flex-grow: 1;
    border-radius: $border-radius-root;

    .device-type-field {
      height: calc(80dvh - 100px);
      flex-grow: 1;
      display: flex;
      align-items: center;
    }
  }
}
</style>
