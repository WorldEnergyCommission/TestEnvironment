<template>
  <CoreCard class="h-100">
    <CoreContainer class="h-100">
      <CoreRow v-if="device != undefined">
        <!-- Device Name -->
        <CoreColumn offset-sm="4" sm="4">
          <CoreTextField
            v-model="device.name"
            :label="t('modals.manageDevice.form.name')"
            color="accent"
            hide-details
            max-length="30"
            variant="outlined"
          />
        </CoreColumn>
        <!-- Charger ID -->
        <CoreColumn offset-sm="4" sm="4">
          <CoreTextField
            v-model="device.data.meta.chargerId"
            label="Easee Charger ID"
            color="accent"
            hide-details
            max-length="30"
            variant="outlined"
          />
        </CoreColumn>
        <!-- Room -->
        <CoreColumn offset-sm="4" sm="4">
          <CoreSelect
            v-model="device.collection_id"
            :items="rooms"
            :label="$t('modals.manageDevice.form.areas')"
            color="accent"
            hide-details
            hide-selected
            item-title="name"
            item-value="id"
            variant="outlined"
          />
        </CoreColumn>
      </CoreRow>
      <CoreSpacer />
      <CoreRow>
        <!-- Save Button -->
        <CoreButton class="mr-0 ml-auto" button-type="primary" @click="saveDeviceData()">
          {{ $t("uiComponents.buttons.send") }}
          <template #iconRight>
            <CoreIcon size="15"> far fa-paper-plane </CoreIcon>
          </template>
        </CoreButton>
      </CoreRow>
    </CoreContainer>
  </CoreCard>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";

import { IDevice } from "@/store/modules/devices/types";

// Properties
interface Props {
  deviceData: IDevice;
  isEditModal: boolean;
  activeRoomId: string;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  (e: "handleControl", value: JSON): void;
  (e: "backToChoosingType"): void;
  (e: "closeDialog"): void;
}>();

// Composables
const { t } = useI18n();
const store = useStore();

// Device object we use to edit the deviceData
const device = ref<IDevice>();
const rooms = store.getters["rooms/rooms"];

function saveDeviceData() {
  // Transform the device object to JSON
  const deviceJson: JSON = JSON.parse(JSON.stringify(device.value));
  emit("handleControl", deviceJson);
  emit("closeDialog");
}

watch(
  () => props.isEditModal,
  () => {
    if (props.isEditModal) {
      device.value = props.deviceData;
    } else {
      device.value = {
        name: "",
        data: {
          type: "EaseeWallbox",
          mappings: {},
          meta: {
            chargerId: "",
          },
        },
        collection_id: "",
      };
    }

    if (props.activeRoomId.length && !props.isEditModal) {
      device.value.collection_id = props.activeRoomId;
    }
  },
  {
    immediate: true,
  },
);
</script>
