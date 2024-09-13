<template>
  <FormModal :form-title="formTitle" max-width="1750" @handle-dialog-change="onDialogChange">
    <template #activator>
      <slot />
    </template>
    <template #content>
      <div class="manage-device-new">
        <CoreContainer fluid class="manage-device-new-content h-100">
          <CoreRow class="h-100">
            <CoreColumn v-if="!deviceFormView" class="d-flex flex-column py-0 h-100">
              <!-- Device Type Field -->
              <div class="device-type-field">
                <CoreContainer class="w-75">
                  <!-- Device Type Select -->
                  <CoreRow class="mb-10">
                    <CoreCombobox
                      v-model="deviceType"
                      :items="devicesTypesWithLocaleNamesList"
                      :label="t('modals.manageDevice.form.type')"
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
              <div class="d-flex align-end justify-end">
                <!-- Next Button -->
                <FirstStepActions
                  :disable-next-button="!typeValidation"
                  :next-button-tool-tip="t('modals.manageDevice.tooltips.type')"
                  :hide-next-tool-tip="typeValidation"
                  @next="deviceFormView = true"
                />
              </div>
            </CoreColumn>
            <!-- Schema -->
            <CoreColumn v-if="deviceFormView" class="py-0 h-100">
              <component
                :is="currentDeviceType.manageSchema"
                :active-room-id="activeRoomId"
                :device-data="deviceDataWithType"
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
import { computed } from "vue";
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
  deviceData: {
    name: "",
    data: {
      type: "",
      mappings: {},
    },
    collection_id: "",
  },
  activeRoomId: "",
  formTitle: "",
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

const currentDeviceType = computed(() => {
  if (deviceType.value.value) {
    return devicesTypes.value[deviceType.value.value];
  }
  return {};
});

const deviceDataWithType = computed(() => {
  const clone = JSON.parse(JSON.stringify(props.deviceData));
  clone.data.type = deviceType.value.value;
  return clone;
});

const devicesTypes = computed(() => {
  return store.getters["devices/devicesTypes"];
});

const devicesTypesWithLocaleNamesList = computed(() => {
  return store.getters["devices/devicesTypesWithLocaleNamesList"];
});

const typeValue = computed(() => deviceType.value.value);
const { currentPreviewImage } = usePreviewImage(typeValue);
</script>

<script lang="ts">
// <component is=""> only really works with options api!?
import DefaultSchema from "@/ui/components/modals/ManageDevice/schemas/DefaultSchema.vue";
import DropDownSchema from "@/ui/components/modals/ManageDevice/schemas/DropDownSchema.vue";
import EaseeSchema from "@/ui/components/modals/ManageDevice/schemas/EaseeSchema.vue";
import EnergySchema from "@/ui/components/modals/ManageDevice/schemas/EnergySchema.vue";
import GaugeSchema from "@/ui/components/modals/ManageDevice/schemas/GaugeSchema.vue";
import KineticPowerSchema from "@/ui/components/modals/ManageDevice/schemas/KineticPowerSchema.vue";
import SSPSchema from "@/ui/components/modals/ManageDevice/schemas/SSPSchema.vue";

export default {
  components: {
    DefaultSchema,
    DropDownSchema,
    EaseeSchema,
    EnergySchema,
    GaugeSchema,
    KineticPowerSchema,
    SSPSchema,
  },
};
</script>

<style lang="scss">
@import "./src/ui/scss/variables";

.manage-device-new {
  height: 80dvh;
  display: flex;
  flex-direction: column;

  .manage-device-new-content {
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
