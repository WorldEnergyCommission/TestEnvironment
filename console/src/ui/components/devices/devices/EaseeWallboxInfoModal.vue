<template>
  <EfficientIODialog :dialog-title="deviceName">
    <template #activator="{ props: activatorProps }">
      <CoreButton button-type="standardIcon" v-bind="activatorProps">
        <CoreIcon size="sm" class="mb-1">fas fa-info</CoreIcon>
      </CoreButton>
    </template>
    <template #content>
      <CoreCard>
        <CoreContainer>
          <CoreRow v-if="!loading">
            <CoreColumn cols="6" class="font-weight-bold">
              {{ t("devices.EaseeWallbox.serialNumber") }}:
            </CoreColumn>
            <CoreColumn cols="6">{{ serialNumber }} </CoreColumn>
            <CoreColumn cols="6" class="font-weight-bold">
              {{ t("devices.EaseeWallbox.type") }}:
            </CoreColumn>
            <CoreColumn cols="6">{{ type }} </CoreColumn>
            <CoreColumn cols="6" class="font-weight-bold">
              {{ t("devices.EaseeWallbox.phaseMode.title") }}:
            </CoreColumn>
            <CoreColumn cols="6">{{ phaseModeText }} ({{ phaseMode }}) </CoreColumn>
            <CoreColumn cols="6" class="font-weight-bold">
              {{ t("devices.EaseeWallbox.ledMode.title") }}:
            </CoreColumn>
            <CoreColumn cols="6"> {{ ledModeText }} ({{ ledMode }}) </CoreColumn>
          </CoreRow>
          <CircleSpinner
            v-else
            :size="80"
            color="accent"
            class="d-flex justify-center align-center w-100 h-100"
          />
        </CoreContainer>
      </CoreCard>
    </template>
  </EfficientIODialog>
</template>
<script lang="ts" setup>
import { onMounted, defineProps, ref, computed } from "vue";
import { useI18n } from "vue-i18n";

import api from "@/store/api";
import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import EfficientIODialog from "@/ui/components/modals/EfficientIODialog.vue";

const props = defineProps({
  deviceName: { default: "", type: String },
  deviceId: { default: "", type: String },
  projectId: { default: "", type: String },
});

onMounted(fetchInfo);

const { t } = useI18n();

const ledMode = ref(0);
const phaseMode = ref(0);
const serialNumber = ref("");
const type = ref("");

// 0	Charger Disabled	Charger is disabled.
// 1-8	Charger Updating	Charger is updating.
// 9-15	Charger Updating	Charger is updating.
// 16-17	Charger Faulty	Charger is faulty.
// 18	Standby Master	Standby Master.
// 19	Standby Secondary	Standby Secondary.
// 20	Secondary Unit Searching	Secondary unit searching for master.
// 21	Smart Mode (Not Charging)	Smart mode (Not charging).
// 22	Smart Mode (Charging)	Smart mode (Charging).
// 23	Normal Mode (Not Charging)	Normal mode (Not charging).
// 24	Normal Mode (Charging)	Normal mode (Charging).
// 25	Waiting for Authorization	Waiting for authorization.
// 26	Verifying with Backend	Verifying with backend.
// 27	Check Configuration	Check configuration (Backplate chip defect).
// 29	Pairing RFID Keys	Pairing RFID Keys.
// 43-44	Self Test Mode	Self test mode.
const ledModeText = computed(() => {
  if (ledMode.value == 0) {
    return t("devices.EaseeWallbox.ledMode.disabled");
  } else if (ledMode.value >= 1 && ledMode.value <= 8) {
    return t("devices.EaseeWallbox.ledMode.updating");
  } else if (ledMode.value >= 9 && ledMode.value <= 15) {
    return t("devices.EaseeWallbox.ledMode.updating");
  } else if (ledMode.value >= 16 && ledMode.value <= 17) {
    return t("devices.EaseeWallbox.ledMode.faulty");
  } else if (ledMode.value === 18) {
    return t("devices.EaseeWallbox.ledMode.standbyMaster");
  } else if (ledMode.value === 19) {
    return t("devices.EaseeWallbox.ledMode.standbySecondary");
  } else if (ledMode.value === 20) {
    return t("devices.EaseeWallbox.ledMode.secondaryUnitSearching");
  } else if (ledMode.value === 21) {
    return t("devices.EaseeWallbox.ledMode.smartModeNotCharging");
  } else if (ledMode.value === 22) {
    return t("devices.EaseeWallbox.ledMode.smartModeCharging");
  } else if (ledMode.value === 23) {
    return t("devices.EaseeWallbox.ledMode.normalModeNotCharging");
  } else if (ledMode.value === 24) {
    return t("devices.EaseeWallbox.ledMode.normalModeCharging");
  } else if (ledMode.value === 25) {
    return t("devices.EaseeWallbox.ledMode.waitingForAuthorization");
  } else if (ledMode.value === 26) {
    return t("devices.EaseeWallbox.ledMode.verifyingWithBackend");
  } else if (ledMode.value === 27) {
    return t("devices.EaseeWallbox.ledMode.checkConfiguration");
  } else if (ledMode.value === 29) {
    return t("devices.EaseeWallbox.ledMode.pairingRfidKeys");
  } else if (ledMode.value >= 43 && ledMode.value <= 44) {
    return t("devices.EaseeWallbox.ledMode.selfTestMode");
  } else {
    return t("devices.EaseeWallbox.ledMode.unknown");
  }
});

// one of: 1, 2 or 3
// 		0	Ignore, no phase mode reported
// 		1	Locked to 1-phase
// 		2	Auto phase mode
// 		3	Locked to 3-phase
const phaseModeText = computed(() => {
  switch (phaseMode.value) {
    case 1:
      return t("devices.EaseeWallbox.phaseMode.lockedToOnePhase");
    case 2:
      return t("devices.EaseeWallbox.phaseMode.autoPhaseMode");
    case 3:
      return t("devices.EaseeWallbox.phaseMode.lockedToThreePhase");
    default:
      return t("devices.EaseeWallbox.phaseMode.unknown");
  }
});

const loading = ref(false);

async function fetchInfo() {
  loading.value = true;
  try {
    // Fetch info for device with id: props.deviceId
    const data = await api.fetch(
      `/projects/${props.projectId}/devices/${props.deviceId}/charger-details`,
      "GET",
    );

    // example return data
    // { ledMode: 18,
    // phaseMode: 2,
    // serialNumber: "ECW7UW3D",
    // type:"Easee Charge" }

    // set data to state
    ledMode.value = data.ledMode;
    phaseMode.value = data.phaseMode;
    serialNumber.value = data.serialNumber;
    type.value = data.type;
  } catch {
  } finally {
    loading.value = false;
  }
}
</script>
