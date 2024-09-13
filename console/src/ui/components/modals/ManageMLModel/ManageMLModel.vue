<template>
  <FormModal :form-title="formTitle" max-width="1750" @handle-dialog-change="onDialogChange">
    <template #activator>
      <slot />
    </template>
    <template #content>
      <div class="manage-ml-model">
        <CoreContainer fluid class="manage-ml-model-content h-100">
          <CoreRow class="h-100">
            <CoreColumn v-if="!deviceFormView" class="d-flex flex-column pt-0 h-100">
              <!-- Device Type Field -->
              <div class="device-type-field">
                <CoreContainer class="w-75">
                  <!-- Device Type Select -->
                  <CoreRow class="mb-10">
                    <CoreCombobox
                      v-model="deviceType"
                      :items="mlModelsTypesWithLocaleNamesList"
                      :label="t('modals.manageMLModel.form.type')"
                      :style="deviceType?.value ? 'margin-top: 58px;' : undefined"
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
                  <FirstStepActions
                    :disable-next-button="!typeValidation"
                    :next-button-tool-tip="t('uiComponents.buttons.next')"
                    :hide-next-tool-tip="typeValidation"
                    @next="deviceFormView = true"
                  />
                </CoreColumn>
              </CoreRow>
            </CoreColumn>
            <CoreColumn v-if="deviceFormView" class="h-100">
              <!-- current ML Model schema -->
              <component
                :is="currentMLModelType.manageSchema"
                :active-room-id="activeRoomId"
                :device-data="mlModelDataWithType"
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
import PreviewImage from "@/ui/components/components/PreviewImage.vue";
import { FirstStepActions } from "@/ui/components/modals/components/Actions";
import FormModal from "@/ui/components/modals/FormModal.vue";
// eslint-disable-next-line import/order
import { useCommonDeviceModalState } from "@/ui/components/modals/utils";

// Properties
interface Props {
  deviceData?: IDevice;
  formTitle: string;
  activeRoomId: string;
}

const props = withDefaults(defineProps<Props>(), {
  formTitle: "",
  activeRoomId: "",
  deviceData: {
    name: "",
    data: {
      type: "",
      meta: {},
    },
    collection_id: "",
  },
});

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
  onDialogChange,
  nameTypeValidation: typeValidation,
} = useCommonDeviceModalState(props.deviceData, () => emit("close"));

// Constants
const { t } = useI18n();
const store = useStore();

const currentMLModelType = computed(() => {
  if (deviceType.value.value) {
    return mlModelTypes.value[deviceType.value.value];
  }
  return {};
});

const mlModelDataWithType = computed(() => {
  const clone = JSON.parse(JSON.stringify(props.deviceData));
  clone.data.type = deviceType.value.value;
  return clone;
});

const mlModelsTypesWithLocaleNamesList = computed(() => {
  return store.getters["mpc/mlModelsTypesWithLocaleNamesList"];
});

const mlModelTypes = computed(() => {
  return store.getters["mpc/mlModelTypes"];
});

const typeValue = computed(() => deviceType.value.value);
const { currentPreviewImage } = usePreviewImage(typeValue);
</script>

<script lang="ts">
import DefaultSchema from "@/ui/components/modals/ManageMLModel/schemas/DefaultSchema.vue";
import EMSSchema from "@/ui/components/modals/ManageMLModel/schemas/EMSSchema.vue";
import HCOSchema from "@/ui/components/modals/ManageMLModel/schemas/HCOSchema.vue";
import ServicesSchema from "@/ui/components/modals/ManageMLModel/schemas/ServicesSchema.vue";

export default defineComponent({
  components: {
    HCOSchema,
    EMSSchema,
    DefaultSchema,
    ServicesSchema,
  },
});
</script>

<style lang="scss">
@import "./src/ui/scss/variables";

.manage-ml-model {
  height: 80dvh;
  display: flex;
  flex-direction: column;

  .manage-ml-model-content {
    flex-grow: 1;
    padding: 0px;

    .device-type-field {
      height: calc(80dvh - 100px);
      flex-grow: 1;
      display: flex;
      align-items: center;
    }
  }
}
</style>
