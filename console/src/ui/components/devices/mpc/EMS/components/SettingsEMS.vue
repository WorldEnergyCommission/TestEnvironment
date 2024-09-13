<template>
  <div class="settings-ems pa-3 rounded">
    <CoreTabs v-model="tab" fixed-tabs>
      <CoreTab v-for="(hItem, hIndex) in tabs" :key="hIndex">
        {{ hItem.title }}
      </CoreTab>
    </CoreTabs>
    <!-- EMS settings -->
    <CoreWindow v-model="tab" style="background-color: transparent">
      <CoreWindowItem>
        <div class="settings-ems-fields-wrapper pt-6">
          <CoreRow style="width: 100%">
            <CoreColumn cols="6">
              {{ t("mlModel.EMS.settingsView.fields.sizeMainFuseChargingStation") }}
            </CoreColumn>
            <CoreColumn class="value" cols="6">
              <CoreDialog v-model="sizeMainFuseDialog" max-width="700">
                <template #activator="{ props }">
                  <CoreButton button-type="primary" v-bind="props">
                    {{ t("uiComponents.buttons.openList") }}
                  </CoreButton>
                </template>
                <div class="settings-ems-size-main-fuse-list">
                  <template v-if="sizeMainFuseDialog">
                    <div v-for="(item, index) in sizeMainFuseList" :key="index">
                      <InputFieldBase
                        :description-styles="{ width: '550px', paddingTop: '5px' }"
                        :field-rules="[
                          rules.required,
                          rules.fieldMoreThanNull,
                          rules.fieldLessThan500,
                        ]"
                        :input-field-styles="{ flexGrow: '1', minWidth: '150px' }"
                        :is-decimal="false"
                        :max="500"
                        :min="0"
                        :step="1"
                        :unit-styles="{ width: '60px', textAlign: 'center', paddingTop: '5px' }"
                        :variable-data="{ InputField_targetValue: sizeMainFuse[item] }"
                        :with-spacer="false"
                        instance="InputField"
                        :is-preview="isPreview"
                      >
                        <template #textDescription>
                          <span>{{ t("mlModel.EMS.settingsView.fields.sizeMainFuse") }}</span>
                          <span class="pl-1">{{ index + 1 }}</span>
                        </template>
                        <template #unit> kW </template>
                      </InputFieldBase>
                    </div>
                  </template>
                </div>
              </CoreDialog>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              {{ t("mlModel.EMS.settingsView.fields.maxDephOfDischargeInEmergencyPowerMode") }}
            </CoreColumn>
            <CoreColumn class="value" cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '550px', paddingTop: '5px' }"
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan100]"
                :input-field-styles="{ flexGrow: '1', minWidth: '150px' }"
                :is-decimal="false"
                :max="100"
                :min="0"
                :step="1"
                :unit-styles="{ width: '60px', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="outputFieldMaxDepth"
                instance="InputField"
                :is-preview="isPreview"
              >
                <template #unit> % </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              {{ t("mlModel.EMS.settingsView.fields.reserveInBatteryForEmergencyPowerMode") }}
            </CoreColumn>
            <CoreColumn class="value" cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '550px', paddingTop: '5px' }"
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan100]"
                :input-field-styles="{ flexGrow: '1', minWidth: '150px' }"
                :is-floating-number="false"
                :max="100"
                :min="0"
                :step="1"
                :unit-styles="{ width: '60px', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="outputFieldReserveForEmergency"
                instance="InputField"
                :is-preview="isPreview"
              >
                <template #unit> % </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              {{ t("mlModel.EMS.settingsView.fields.minimalSOCForAdaptiveSelfConsumption") }}
            </CoreColumn>
            <CoreColumn class="value" cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '550px', paddingTop: '5px' }"
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan100]"
                :input-field-styles="{ flexGrow: '1', minWidth: '150px' }"
                :is-floating-number="false"
                :max="100"
                :min="0"
                :step="1"
                :unit-styles="{ width: '60px', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="outputFieldAdaptiveSelfConsumption"
                instance="InputField"
                :is-preview="isPreview"
              >
                <template #unit> % </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              {{
                t("mlModel.EMS.settingsView.fields.priorityMinChargeBatterySOCInEmergencyPowerMode")
              }}
            </CoreColumn>
            <CoreColumn class="value" cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '550px', paddingTop: '5px' }"
                :field-rules="[
                  rules.required,
                  rules.fieldMoreThanNull,
                  rules.fieldLessThan75,
                  rules.fieldMoreThan25,
                ]"
                :input-field-styles="{ flexGrow: '1', minWidth: '150px' }"
                :is-decimal="false"
                :max="75"
                :min="25"
                :step="1"
                :unit-styles="{ width: '60px', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="outputFieldMinCharge"
                instance="InputField"
                :is-preview="isPreview"
              >
                <template #unit> % </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              {{ t("mlModel.EMS.settingsView.fields.reserveChargingFromGrid") }}
            </CoreColumn>
            <CoreColumn class="value" cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '550px', paddingTop: '5px' }"
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan100]"
                :input-field-styles="{ flexGrow: '1', minWidth: '150px' }"
                :is-decimal="false"
                :max="100"
                :min="0"
                :step="1"
                :unit-styles="{ width: '60px', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="outputFieldReserveChargingFromGrid"
                instance="InputField"
                :is-preview="isPreview"
              >
                <template #unit> % </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              {{ t("mlModel.EMS.settingsView.fields.updatingTimeEMS") }}
            </CoreColumn>
            <CoreColumn class="value" cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '550px', paddingTop: '5px' }"
                :field-rules="[
                  rules.required,
                  rules.fieldMoreThanNull,
                  rules.fieldLessThan600,
                  rules.fieldMoreThan1,
                ]"
                :input-field-styles="{ flexGrow: '1', minWidth: '150px' }"
                :is-decimal="false"
                :max="600"
                :min="1"
                :step="1"
                :unit-styles="{ width: '60px', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="outputFieldUpdatingTime"
                instance="InputField"
                :is-preview="isPreview"
              >
                <template #unit> sec </template>
              </InputFieldBase>
            </CoreColumn>
            <!-- Operation Mode EMS Dropdown -->
            <CoreColumn cols="12" md="6">
              <DropDownBase
                :label="t('mlModel.EMS.settingsView.fields.operationModeEMS')"
                :text-mapping="textMappingOperation"
                :variable-data="dropDownOperation"
                instance="DropDown"
                style="max-width: 434px !important"
              />
            </CoreColumn>
            <!-- Message EMS Function Dropdown -->
            <CoreColumn cols="12" md="6">
              <DropDownBase
                :label="t('mlModel.EMS.settingsView.fields.messageEMSFunction')"
                :text-mapping="textMappingMessage"
                :variable-data="dropDownMessage"
                instance="DropDown"
                style="max-width: 434px !important"
              />
            </CoreColumn>
            <CoreColumn cols="6">
              <LabelUnitWrapper
                :is-value="false"
                :variables-list-for-check="[mappingsList.enable_ems, mappingsList.state_enable_ems]"
              >
                <template #label>
                  {{ t("mlModel.EMS.settingsView.fields.enableEMS") }}
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn class="value" cols="6">
              <Switch2VBase
                :variable-data="switch2VEnable"
                instance="Switch2V"
                style="margin: 0 0 3px 10px"
              />
            </CoreColumn>
            <CoreColumn cols="6">
              <LabelUnitWrapper
                :is-value="false"
                :variables-list-for-check="[
                  mappingsList.allow_charging_button,
                  mappingsList.allow_charging_state,
                ]"
              >
                <template #label>
                  {{ t("mlModel.EMS.settingsView.fields.allowedChargingFromGrid") }}
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn class="value" cols="6">
              <Switch2VBase
                :variable-data="switch2VAllowChargingFromGrid"
                instance="Switch2V"
                style="margin: 0 0 3px 10px"
              />
            </CoreColumn>
            <CoreColumn cols="6">
              <LabelUnitWrapper :is-value="false" :variables-list-for-check="[]">
                <template #label>
                  {{ t("mlModel.EMS.settingsView.fields.mainFuseMonitoring") }}
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn class="value" cols="6">
              <Switch2VBase
                :variable-data="switch2VMainFuseMonitoring"
                instance="Switch2V"
                style="margin: 0 0 3px 10px"
              />
            </CoreColumn>
          </CoreRow>
        </div>
      </CoreWindowItem>
      <!-- Mode settings -->
      <CoreWindowItem>
        <div class="settings-ems-fields-wrapper pt-6">
          <CoreRow style="width: 100%">
            <CoreColumn cols="12">
              <h3>{{ t("mlModel.EMS.settingsView.workMode") }}</h3>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <!-- Work Mode Dropdown -->
              <CoreSelect
                v-model="workModeEMS"
                :items="emsSettingsWorkModeItems"
                :label="t('mlModel.EMS.settingsView.workMode')"
                hide-details
                hide-selected
                item-title="name"
                item-value="value"
              />
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <CoreButton
                button-type="primary"
                :disabled="updateWorkmodeDisabled"
                @click="updateWorkmode"
              >
                {{ t("uiComponents.buttons.save") }}
              </CoreButton>
            </CoreColumn>
            <!-- EMS Model Dropdown -->
            <CoreColumn cols="12">
              <h3>{{ t("mlModel.EMS.settingsView.fields.algorithm_model_ems") }}</h3>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <CoreSelect
                v-model="algorithmModelEms"
                :items="emsSettingsAlgorithmModelItems"
                :label="t('mlModel.EMS.settingsView.fields.algorithm_model_ems')"
                hide-details
                hide-selected
                item-title="name"
                item-value="value"
              />
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <CoreButton
                button-type="primary"
                :disabled="updateAlgoModelDisabled"
                @click="updateAlgoModel"
              >
                {{ t("uiComponents.buttons.save") }}
              </CoreButton>
            </CoreColumn>

            <!-- Electric Tariff Settings -->
            <CoreColumn cols="12">
              <h3>{{ t("mlModel.EMS.electricTariff.title") }}</h3>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <CoreTextField
                v-model="start_low"
                :label="t('mlModel.EMS.electricTariff.startLowTariff')"
                :rules="[rules.required, rules.fieldTimeInHHMM]"
                hide-details="auto"
                required
              />
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <CoreTextField
                :label="t('mlModel.EMS.electricTariff.startHighTariff')"
                :model-value="startHighTime"
                hide-details="auto"
                readonly
                required
              />
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <CoreTextField
                v-model="end_low"
                :label="t('mlModel.EMS.electricTariff.endLowTariff')"
                :rules="[rules.required, rules.fieldTimeInHHMM]"
                hide-details="auto"
                required
              />
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <CoreTextField
                :label="t('mlModel.EMS.electricTariff.endHighTariff')"
                :model-value="endHighTime"
                hide-details="auto"
                readonly
                required
              />
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <CoreTextField
                v-model.number="price_low"
                :label="t('mlModel.EMS.electricTariff.priceLowTariff', { count: 1 })"
                :rules="[rules.required]"
                hide-details="auto"
                required
              />
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <CoreTextField
                v-model.number="price_high"
                :label="t('mlModel.EMS.electricTariff.priceHighTariff', { count: 2 })"
                :rules="[rules.required]"
                hide-details="auto"
                required
              />
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <TimezoneChooser
                :current-value="timezone"
                class="flex-grow-0"
                @on-change="onTimezoneChange"
              />
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <CoreButton
                :disabled="!tariffValidation"
                button-type="primary"
                @click="updateTarifSettings"
              >
                {{ t("uiComponents.buttons.save") }}
              </CoreButton>
            </CoreColumn>
          </CoreRow>
          <!-- Battery Standby Optimization Settings -->
          <CoreRow style="width: 100%">
            <!-- Header -->
            <CoreColumn cols="12">
              <h3>{{ t("mlModel.EMS.batteryStandbyOptimization.title") }}</h3>
            </CoreColumn>
            <!-- Work mode dropdown -->
            <CoreColumn cols="12" md="6">
              <DropDownBase
                instance="DropDown"
                :variable-data="dropDownMode"
                :text-mapping="textMappingMode"
                :label="t('mlModel.EMS.batteryStandbyOptimization.workingMode')"
              />
            </CoreColumn>
            <!-- Form for power threshold -->
            <CoreColumn cols="12">
              <InputFieldBase
                instance="InputField"
                :min="1"
                :step="1"
                :max="1000"
                :is-decimal="false"
                :with-spacer="false"
                :is-preview="isPreview"
                :input-field-styles="{ width: '25%', maxWidth: '25%' }"
                :variable-data="outputFieldPowerOn"
                :field-rules="[rules.fieldLessThan1000]"
                :unit-styles="{ width: '25%', textAlign: 'center' }"
                :description-styles="{ width: '25%', textAlign: 'center' }"
              >
                <template #textDescription>
                  {{ t("mlModel.EMS.batteryStandbyOptimization.powerThresholdOn") }}
                </template>
                <template #unit> kW </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12">
              <InputFieldBase
                instance="InputField"
                :min="1"
                :step="1"
                :max="1000"
                :is-decimal="false"
                :with-spacer="false"
                :is-preview="isPreview"
                :input-field-styles="{ width: '25%', maxWidth: '25%' }"
                :variable-data="outputFieldPowerOff"
                :field-rules="[rules.fieldLessThan1000]"
                :unit-styles="{ width: '25%', textAlign: 'center' }"
                :description-styles="{ width: '25%', textAlign: 'center' }"
              >
                <template #textDescription>
                  {{ t("mlModel.EMS.batteryStandbyOptimization.powerThresholdOff") }}
                </template>
                <template #unit> kW </template>
              </InputFieldBase>
            </CoreColumn>
            <!-- Form for time threshold -->
            <CoreColumn cols="12">
              <InputFieldBase
                instance="InputField"
                :min="1"
                :step="1"
                :max="1000"
                :is-decimal="false"
                :with-spacer="false"
                :is-preview="isPreview"
                :input-field-styles="{ width: '25%', maxWidth: '25%' }"
                :variable-data="outputFieldTimeOn"
                :field-rules="[rules.fieldLessThan1000]"
                :unit-styles="{ width: '25%', textAlign: 'center' }"
                :description-styles="{ width: '25%', textAlign: 'center' }"
              >
                <template #textDescription>
                  {{ t("mlModel.EMS.batteryStandbyOptimization.timeThresholdOn") }}
                </template>
                <template #unit> min </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12">
              <InputFieldBase
                instance="InputField"
                :min="1"
                :step="1"
                :max="1000"
                :is-decimal="false"
                :with-spacer="false"
                :is-preview="isPreview"
                :input-field-styles="{ width: '25%', maxWidth: '25%' }"
                :variable-data="outputFieldTimeOff"
                :field-rules="[rules.fieldLessThan1000]"
                :unit-styles="{ width: '25%', textAlign: 'center' }"
                :description-styles="{ width: '25%', textAlign: 'center' }"
              >
                <template #textDescription>
                  {{ t("mlModel.EMS.batteryStandbyOptimization.timeThresholdOff") }}
                </template>
                <template #unit> min </template>
              </InputFieldBase>
            </CoreColumn>
          </CoreRow>
        </div>
      </CoreWindowItem>
    </CoreWindow>
  </div>
</template>

<script setup lang="ts">
import moment from "moment";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";

import { IDevice } from "@/store/modules/devices/types";
import TimezoneChooser from "@/ui/components/components/TimezoneChooser.vue";
import LabelUnitWrapper from "@/ui/components/devices/components/LabelUnitWrapper.vue";
import DropDownBase from "@/ui/components/devices/devices/base/DropDown.vue";
import InputFieldBase from "@/ui/components/devices/devices/base/InputFieldBase.vue";
import Switch2VBase from "@/ui/components/devices/devices/base/Switch2VBase.vue";
import { useValidationRules } from "@/ui/mixins/validation";
import { minutesToTime, timeToMinutes } from "@/utils/utilsFunctions";

// Properties
interface Props {
  // Data was loaded from mpc/fetchMPCData (loads full mpc instance data by id)
  mpcData: IDevice;
  // Data was loaded from mpc/fetchMPCListByProject (loads a list of mps but with incomplete data)
  deviceData: IDevice;
  isPreview: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isPreview: false,
});

// Constants
const tab = ref(null);
const { t } = useI18n();
const store = useStore();
const rules = useValidationRules();
const end_low = ref<any | null>(null);
const price_low = ref<any | null>(null);
const start_low = ref<any | null>(null);
const price_high = ref<any | null>(null);
// Defines the EMS Model
const algorithmModelEms = ref<null | number>(null);
const sizeMainFuseDialog = ref<boolean>();
// Defines the EMS Work Mode
const workModeEMS = ref<null | number>(null);
const timezone = ref<string | undefined>(undefined);

// Computed Properties
const tabs = computed(() => {
  return [
    { title: t("mlModel.EMS.settingsView.tabs.emsSettings") },
    { title: t("mlModel.EMS.settingsView.tabs.modeSettings") },
  ];
});

const mappingsList = computed(() => {
  const {
    state_enable_ems,
    enable_ems,
    operation_mode,
    message,
    size_main_fuse,
    max_depth,
    reserve_battery,
    adaptive_self_consumption,
    min_charge_battery,
    reserve_charge,
    update_time,
    allow_charging_button,
    allow_charging_state,
    activate_main_fuse,
    state_main_fuse,
  } = props.mpcData.data.meta.controllerMappings;

  return {
    state_enable_ems,
    enable_ems,
    operation_mode,
    message,
    size_main_fuse,
    max_depth,
    reserve_battery,
    adaptive_self_consumption,
    min_charge_battery,
    reserve_charge,
    update_time,
    allow_charging_button,
    allow_charging_state,
    activate_main_fuse,
    state_main_fuse,
  };
});

const batteryStandbyOptimizationMappingsList = computed(() => {
  const {
    battery_standby_optimization_state,
    battery_standby_optimization_mode,
    battery_standby_optimization_time_on,
    battery_standby_optimization_time_off,
    battery_standby_optimization_power_on,
    battery_standby_optimization_power_off,
  } = props.mpcData.data.meta.controllerMappings.battery.components.battery1;

  return {
    battery_standby_optimization_state,
    battery_standby_optimization_mode,
    battery_standby_optimization_time_on,
    battery_standby_optimization_time_off,
    battery_standby_optimization_power_on,
    battery_standby_optimization_power_off,
  };
});

// Operation Dropdown - Text Mapping
const textMappingOperation = computed(() => {
  return {
    0: t("mlModel.EMS.settingsView.mappingOperation.allOff"),
    1: t("mlModel.EMS.settingsView.mappingOperation.selfConsumption"),
    2: t("mlModel.EMS.settingsView.mappingOperation.peakLoadCapping"),
    3: t("mlModel.EMS.settingsView.mappingOperation.loadManagement"),
    4: t("mlModel.EMS.settingsView.mappingOperation.adaptiveSelfConsumption"),
  };
});

// Operation Dropdown - Get Value
const dropDownOperation = computed(() => {
  return { DropDown_targetValue: mappingsList.value.operation_mode };
});

// Message Dropdown - Text Mapping
const textMappingMessage = computed(() => {
  return {
    0: t("mlModel.EMS.settingsView.mappingMessage.disabled"),
    1: t("mlModel.EMS.settingsView.mappingMessage.enabled"),
    2: t("mlModel.EMS.settingsView.mappingMessage.allPrioritiesAtMinimum"),
    3: t("mlModel.EMS.settingsView.mappingMessage.allPrioritiesAtMaximum"),
    4: t("mlModel.EMS.settingsView.mappingMessage.missingPowerValuesOnDeviceSetup"),
    5: t("mlModel.EMS.settingsView.mappingMessage.tooManyFunctionsInThisProject"),
  };
});

// Message Dropdown - Get Value
const dropDownMessage = computed(() => {
  return { DropDown_targetValue: mappingsList.value.message };
});

// Mode Dropdown - Text Mapping
const textMappingMode = computed(() => {
  return {
    0: t("mlModel.EMS.batteryStandbyOptimization.workingModeDeactivated"),
    2: t("mlModel.EMS.batteryStandbyOptimization.workingModeLoadBased"),
  };
});

// Mode Dropdown - Get Value
const dropDownMode = computed(() => {
  return {
    DropDown_targetValue:
      batteryStandbyOptimizationMappingsList.value.battery_standby_optimization_mode,
  };
});

const switch2VEnable = computed(() => {
  return {
    Switch2V_onOff: mappingsList.value.enable_ems,
    Switch2V_state: mappingsList.value.state_enable_ems,
  };
});

const switch2VAllowChargingFromGrid = computed(() => {
  return {
    Switch2V_onOff: mappingsList.value.allow_charging_button,
    Switch2V_state: mappingsList.value.allow_charging_state,
  };
});

const switch2VMainFuseMonitoring = computed(() => {
  return {
    Switch2V_onOff: mappingsList.value.activate_main_fuse,
    Switch2V_state: mappingsList.value.state_main_fuse,
  };
});

const outputFieldMaxDepth = computed(() => {
  return { InputField_targetValue: mappingsList.value.max_depth };
});

const outputFieldReserveForEmergency = computed(() => {
  return { InputField_targetValue: mappingsList.value.reserve_battery };
});

const outputFieldAdaptiveSelfConsumption = computed(() => {
  return mappingsList.value.adaptive_self_consumption &&
    mappingsList.value.adaptive_self_consumption != ""
    ? { InputField_targetValue: mappingsList.value.adaptive_self_consumption }
    : null;
});

const outputFieldMinCharge = computed(() => {
  return { InputField_targetValue: mappingsList.value.min_charge_battery };
});

const outputFieldReserveChargingFromGrid = computed(() => {
  return { InputField_targetValue: mappingsList.value.reserve_charge };
});

const outputFieldUpdatingTime = computed(() => {
  return { InputField_targetValue: mappingsList.value.update_time };
});

const outputFieldPowerOn = computed(() => {
  return {
    InputField_targetValue:
      batteryStandbyOptimizationMappingsList.value.battery_standby_optimization_power_on,
  };
});

const outputFieldPowerOff = computed(() => {
  return {
    InputField_targetValue:
      batteryStandbyOptimizationMappingsList.value.battery_standby_optimization_power_off,
  };
});

const outputFieldTimeOn = computed(() => {
  return {
    InputField_targetValue:
      batteryStandbyOptimizationMappingsList.value.battery_standby_optimization_time_on,
  };
});

const outputFieldTimeOff = computed(() => {
  return {
    InputField_targetValue:
      batteryStandbyOptimizationMappingsList.value.battery_standby_optimization_time_off,
  };
});

// Size main fuse object
const sizeMainFuse = computed(() => {
  return mappingsList.value.size_main_fuse;
});

const sizeMainFuseList = computed(() => {
  return Object.keys(mappingsList.value.size_main_fuse);
});

// Mode settings
const emsSettingsWorkModeItems = computed(() => {
  return [
    { value: 0, name: t("mlModel.EMS.settingsView.tariffModes.energyOptimized") },
    { value: 1, name: t("mlModel.EMS.settingsView.tariffModes.balancedOptimization") },
    { value: 2, name: t("mlModel.EMS.settingsView.tariffModes.tariffOptimized") },
    { value: 3, name: t("mlModel.EMS.settingsView.tariffModes.disabledMode") },
  ];
});

// Model settings
const emsSettingsAlgorithmModelItems = computed(() => {
  return [
    { value: 0, name: t("mlModel.EMS.settingsView.mappingModel.standard") },
    { value: 1, name: t("mlModel.EMS.settingsView.mappingModel.hypermodelOne") },
  ];
});

const startLowMinutes = computed(() => {
  const reg = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(start_low.value);
  return reg ? timeToMinutes(start_low.value) : null;
});

const endLowMinutes = computed(() => {
  const reg = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(end_low.value);
  return reg ? timeToMinutes(end_low.value) : null;
});

const startHighMinutes = computed(() => {
  if (typeof endLowMinutes.value !== "number") return null;
  return endLowMinutes.value === 1439 ? 0 : endLowMinutes.value + 1;
});

const endHighMinutes = computed(() => {
  if (typeof startLowMinutes.value !== "number") return null;
  return startLowMinutes.value === 0 ? 1439 : startLowMinutes.value - 1;
});

const startHighTime = computed(() => {
  if (typeof startHighMinutes.value !== "number") return null;
  return minutesToTime(startHighMinutes.value);
});

const endHighTime = computed(() => {
  if (typeof endHighMinutes.value !== "number") return null;
  return minutesToTime(endHighMinutes.value);
});

/**
 * Tariff validation
 * @return {boolean} validation status
 */
const tariffValidation = computed(() => {
  const priceLow = typeof price_low.value === "number";
  const priceHigh = typeof price_high.value === "number";
  return !!startLowMinutes.value && !!endLowMinutes.value && priceLow && priceHigh;
});

// Functions
const onTimezoneChange = (newTimezone: string) => {
  timezone.value = newTimezone;
};

// Get the current values for all settings form the device data
function getCurrentSettings() {
  workModeEMS.value = props.deviceData.data.meta?.settings?.mode;

  // Get the ems model, if no model is set, the standard model is initialized
  algorithmModelEms.value = props.deviceData.data.meta?.settings?.model
    ? props.deviceData.data.meta?.settings?.model
    : 0;

  start_low.value =
    typeof props.deviceData.data.meta?.settings?.energyPrice?.start_low === "number"
      ? minutesToTime(props.deviceData.data.meta?.settings?.energyPrice?.start_low)
      : null;

  end_low.value =
    typeof props.deviceData.data.meta?.settings?.energyPrice?.end_low === "number"
      ? minutesToTime(props.deviceData.data.meta?.settings?.energyPrice?.end_low)
      : null;

  price_low.value = props.deviceData.data.meta?.settings?.energyPrice?.price_low;

  price_high.value = props.deviceData.data.meta?.settings?.energyPrice?.price_high;

  timezone.value = props.deviceData.data.meta?.settings?.energyPrice?.timezone ?? moment.tz.guess();
}

async function updateTarifSettings() {
  const converted = {
    start_low: startLowMinutes.value,
    end_low: endLowMinutes.value,
    start_high: startHighMinutes.value,
    end_high: endHighMinutes.value,
    price_low: price_low.value,
    price_high: price_high.value,
    timezone: timezone.value,
  };

  const newSettings = {
    energyPrice: { ...converted },
  };

  await store.dispatch("mpc/updateTariffSettings", {
    mpcId: props.mpcData.id,
    settings: newSettings,
  });
}

const updateAlgoModelDisabled = computed(
  () =>
    algorithmModelEms.value ===
    (props.deviceData.data.meta?.settings?.model ? props.deviceData.data.meta?.settings?.model : 0),
);
async function updateAlgoModel() {
  await store.dispatch("mpc/updateTariffSettings", {
    mpcId: props.mpcData.id,
    settings: { algorithmModelEms: algorithmModelEms.value },
  });
}

const updateWorkmodeDisabled = computed(
  () => workModeEMS.value === props.deviceData.data.meta?.settings?.mode,
);
async function updateWorkmode() {
  await store.dispatch("mpc/updateTariffSettings", {
    mpcId: props.mpcData.id,
    settings: { mode: workModeEMS.value },
  });
}

// Lifecycle Hooks
onMounted(() => {
  getCurrentSettings();
});
</script>

<style lang="scss">
.settings-ems {
  min-height: 65dvh;

  background: rgb(var(--v-theme-deviceBackground));

  .settings-ems-fields-wrapper {
    overflow-y: auto;
    height: 60dvh;

    .value {
      display: flex;
      align-items: center;
      justify-content: center;
      @media all and (max-width: 1024px) {
        justify-content: flex-end;
      }
    }
  }
}

.settings-ems-size-main-fuse-list {
  background: rgb(var(--v-theme-surface));
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}
</style>
