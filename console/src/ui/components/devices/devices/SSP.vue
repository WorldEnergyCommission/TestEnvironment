<template>
  <DefaultDeviceLayout
    :device-data="props.deviceData"
    :is-preview="false"
    :preview-data="props.deviceData"
  >
    <template #basic-controls>
      <v-container
        :class="['w-100 h-100 pa-0']"
        :style="`
          display: grid;
          grid-template-rows: ${$vuetify.display.mobile ? '1fr min-content' : 'min-content 1fr'};
          padding-left: 36px !important;
          margin-left: -40px;
          margin-right: -40px;
        `"
      >
        <div
          v-if="!$vuetify.display.mobile"
          align="center"
          justify="center"
          class="mt-3"
          style="overflow: hidden; margin-inline: -18px"
        >
          <v-btn-toggle
            v-model="tab"
            variant="outlined"
            color="accent"
            mandatory
            density="'compact'"
          >
            <v-btn> {{ $t("devices.SSP.mainView.outputs") }} </v-btn>
            <v-btn> {{ $t("devices.SSP.mainView.inputs") }} </v-btn>
            <v-btn> {{ $t("devices.SSP.mainView.details") }} </v-btn>
          </v-btn-toggle>
        </div>
        <!-- Outputs -->
        <svg
          v-if="tab == 0"
          viewBox="0 0 1920 3072"
          :class="[{ 'w-100 h-100': $vuetify.display.mobile }]"
          style="overflow: hidden; max-height: 100%; max-width: 100%; margin: auto"
        >
          <image :xlink:href="`/assets/ssp/FrontWODoorCroped.webp`" />
          <defs>
            <filter id="gausFilter">
              <feGaussianBlur stdDeviation="50" />
            </filter>
            <mask id="sspMask">
              <rect
                x="100"
                y="100"
                width="1720"
                height="2672"
                fill="white"
                filter="url(#gausFilter)"
              />
              <!-- second rect to hide lines behind powerlink (middle between metal and plastic)-->
              <rect x="448" y="1679" width="1025" height="75" />
            </mask>
          </defs>
          <!-- Top connector -->
          <SVGGradient
            v-if="hasECharger"
            :start-color="isEChargerEnabled ? 'green' : 'darkGrey'"
            :end-color="isEChargerEnabled ? 'red' : 'gainsboro'"
          >
            <path d="M0 2500 Q1010 2400,1055 783" stroke-width="35" mask="url(#sspMask)" />
          </SVGGradient>

          <!-- bottom input -->
          <SVGGradient v-if="hasInput" start-color="red" end-color="yellow">
            <path d="M607 1860 Q540 2900,0 3000" stroke-width="35" mask="url(#sspMask)" />
          </SVGGradient>

          <!-- 3 Connectors bottom -->
          <SVGGradient
            v-if="has32A1"
            :start-color="is32A1Enabled ? 'red' : 'darkGrey'"
            :end-color="is32A1Enabled ? 'yellow' : 'ghostwhite'"
          >
            <path d="M3072 2800 Q1117 2800,1117 1545" stroke-width="35" mask="url(#sspMask)" />
          </SVGGradient>

          <SVGGradient
            v-if="has32A2"
            :start-color="is32A2Enabled ? 'red' : 'darkGrey'"
            :end-color="is32A2Enabled ? 'yellow' : 'ghostwhite'"
          >
            <path d="M3072 2600 Q1220 2800,1215 1545" stroke-width="35" mask="url(#sspMask)" />
          </SVGGradient>

          <SVGGradient
            v-if="has16A"
            :start-color="is16AEnabled ? 'red' : 'darkGrey'"
            :end-color="is16AEnabled ? 'yellow' : 'ghostwhite'"
          >
            <path d="M3072 2400 Q1315 2800,1310 1545" stroke-width="35" mask="url(#sspMask)" />
          </SVGGradient>

          <!-- Top connector -->
          <OutputSlotBase :variable-data="props.deviceData.data.mappings" instance="OutputECharger">
            <template #default="{ localisation }">
              <SVGDialog
                :size="{ width: 85, height: 140 }"
                :position="{ x: 1010, y: 645 }"
                :tooltip="`${$t('devices.SSP.mainView.OutputEChargerPower')}:  ${localisation} kW`"
                :dialog-title="$t('devices.SSP.mainView.OutputECharger')"
              >
                <template #content>
                  <v-container>
                    <v-row>
                      <SSPOutputControls
                        :mappings="props.deviceData.data.mappings"
                        control-instance="OutputECharger"
                        output-instance="OutputECharger"
                      />
                    </v-row>
                  </v-container>
                </template>
              </SVGDialog>
            </template>
          </OutputSlotBase>

          <!-- Schuko -->
          <OutputSlotBase :variable-data="props.deviceData.data.mappings" instance="OutputSchuko">
            <template #default="{ localisation }">
              <SVGTolltip
                :size="{ width: 210, height: 570 }"
                :position="{ x: 1140, y: 675 }"
                :tooltip="`${$t('devices.SSP.mainView.OutputSchukoPower')}:  ${localisation} kW`"
              />
            </template>
          </OutputSlotBase>

          <!-- 3 Connectors bottom -->
          <OutputSlotBase :variable-data="props.deviceData.data.mappings" instance="Output32A1">
            <template #default="{ localisation }">
              <SVGDialog
                :size="{ width: 85, height: 130 }"
                :position="{ x: 1075, y: 1415 }"
                :tooltip="`${$t('devices.SSP.mainView.Output32A1Power')}:  ${localisation} kW`"
                :dialog-title="$t('devices.SSP.mainView.Output32A1')"
              >
                <template #content>
                  <v-container>
                    <v-row>
                      <SSPOutputControls
                        :mappings="props.deviceData.data.mappings"
                        control-instance="Output32A1"
                        output-instance="Output32A1"
                      />
                    </v-row>
                  </v-container>
                </template>
              </SVGDialog>
            </template>
          </OutputSlotBase>

          <OutputSlotBase :variable-data="props.deviceData.data.mappings" instance="Output32A2">
            <template #default="{ localisation }">
              <SVGDialog
                :size="{ width: 85, height: 130 }"
                :position="{ x: 1175, y: 1415 }"
                :tooltip="`${$t('devices.SSP.mainView.Output32A2Power')}:  ${localisation} kW`"
                :dialog-title="$t('devices.SSP.mainView.Output32A2')"
              >
                <template #content>
                  <v-container>
                    <v-row>
                      <SSPOutputControls
                        :mappings="props.deviceData.data.mappings"
                        control-instance="Output32A2"
                        output-instance="Output32A2"
                      />
                    </v-row>
                  </v-container>
                </template>
              </SVGDialog>
            </template>
          </OutputSlotBase>

          <OutputSlotBase :variable-data="props.deviceData.data.mappings" instance="Output16A">
            <template #default="{ localisation }">
              <SVGDialog
                :size="{ width: 85, height: 130 }"
                :position="{ x: 1270, y: 1415 }"
                :tooltip="`${$t('devices.SSP.mainView.Output16APower')}:  ${localisation} kW`"
                :dialog-title="$t('devices.SSP.mainView.Output16A')"
              >
                <template #content>
                  <v-container>
                    <v-row>
                      <SSPOutputControls
                        :mappings="props.deviceData.data.mappings"
                        control-instance="Output16A"
                        output-instance="Output16A"
                      />
                    </v-row>
                  </v-container>
                </template>
              </SVGDialog>
            </template>
          </OutputSlotBase>

          <!-- Fuses Outputs -->
          <SVGTolltip
            :size="{ width: 405, height: 700 }"
            :position="{ x: 540, y: 650 }"
            :tooltip="$t('devices.SSP.mainView.fusesOutputs')"
          />
          <!-- bottom outside connector -->
          <OutputSlotBase :variable-data="props.deviceData.data.mappings" instance="InputOutside">
            <template #default="{ localisation }">
              <SVGTolltip
                :size="{ width: 75, height: 110 }"
                :position="{ x: 570, y: 1760 }"
                :tooltip="`${$t('devices.SSP.mainView.InputOutsidePower')}:  ${localisation} kW`"
              />
            </template>
          </OutputSlotBase>
        </svg>
        <!-- Inputs  -->
        <svg
          v-if="tab == 1"
          viewBox="0 0 1920 3072"
          :class="[{ 'w-100 h-100': $vuetify.display.mobile }]"
          style="overflow: hidden; max-height: 100%; max-width: 100%; margin: auto"
        >
          <defs>
            <filter id="gausFilter">
              <feGaussianBlur stdDeviation="50" />
            </filter>
            <mask id="sspMask">
              <rect
                x="100"
                y="100"
                width="1720"
                height="2672"
                fill="white"
                filter="url(#gausFilter)"
              />
            </mask>
          </defs>
          <image :xlink:href="`/assets/ssp/BackWODoorCroped.webp`" />

          <!-- Gradient Lines for Inputs -->
          <SVGGradient v-if="hasBattery" start-color="green" end-color="yellow">
            <path d="M0 2600 Q590 2600,630 1545" stroke-width="35" mask="url(#sspMask)" />
          </SVGGradient>

          <SVGGradient v-if="hasPV" start-color="green" end-color="yellow">
            <path d="M0 2800 Q700 2800,740 1545" stroke-width="35" mask="url(#sspMask)" />
          </SVGGradient>

          <SVGGradient v-if="hasInput" start-color="red" end-color="yellow">
            <path d="M3072 2800 Q1330 2800,1325 1918" stroke-width="35" mask="url(#sspMask)" />
          </SVGGradient>

          <!-- Bottom connector -->
          <OutputSlotBase :variable-data="props.deviceData.data.mappings" instance="InputOutside">
            <template #default="{ localisation }">
              <SVGTolltip
                :size="{ width: 80, height: 160 }"
                :position="{ x: 1285, y: 1750 }"
                :tooltip="`${$t('devices.SSP.mainView.InputOutsidePower')}:  ${localisation} kW`"
              />
            </template>
          </OutputSlotBase>
          <!-- Battery & PV - 2 Connectors left -->
          <OutputSlotBase :variable-data="props.deviceData.data.mappings" instance="InputBattery">
            <template #default="{ localisation }">
              <SVGTolltip
                :size="{ width: 80, height: 130 }"
                :position="{ x: 590, y: 1420 }"
                :tooltip="`${$t('devices.SSP.mainView.InputBatteryPower')}:  ${localisation} kW`"
              />
            </template>
          </OutputSlotBase>
          <OutputSlotBase :variable-data="props.deviceData.data.mappings" instance="InputPV">
            <template #default="{ localisation }">
              <SVGTolltip
                :size="{ width: 80, height: 130 }"
                :position="{ x: 700, y: 1420 }"
                :tooltip="`${$t('devices.SSP.mainView.InputPVPower')}:  ${localisation} kW`"
              />
            </template>
          </OutputSlotBase>
          <!-- Core1 -->
          <SVGTolltip
            :size="{ width: 420, height: 760 }"
            :position="{ x: 530, y: 590 }"
            :tooltip="$t('devices.SSP.mainView.core1')"
          />
          <!-- Fuses -->
          <SVGTolltip
            :size="{ width: 405, height: 695 }"
            :position="{ x: 960, y: 655 }"
            :tooltip="$t('devices.SSP.mainView.fusesInputs')"
          />
        </svg>
        <div v-if="tab == 2" :class="[{ 'mt-12': $vuetify.display.mobile }]" style="overflow: auto">
          <SSPDetails :mappings="props.deviceData.data.mappings" />
        </div>

        <div
          v-if="$vuetify.display.mobile"
          align="center"
          justify="center"
          class="mb-3"
          style="overflow: hidden; margin-inline: -18px; margin-top: auto"
        >
          <div class="d-flex justify-space-around align-center">
            <v-btn variant="tonal" color="accent" @click="toggleView">
              <v-icon>fas fa-repeat</v-icon>
            </v-btn>
            <EfficientIODialog :dialog-title="$t('devices.SSP.mainView.details')">
              <template #activator="{ props }">
                <v-btn variant="tonal" color="accent" v-bind="props">
                  {{ $t("devices.SSP.mainView.details") }}
                </v-btn>
              </template>
              <template #content>
                <SSPDetails :mappings="props.deviceData.data.mappings" />
              </template>
            </EfficientIODialog>
          </div>
        </div>
      </v-container>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DefaultDeviceLayout>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";

import { IDevice } from "@/store/modules/devices/types";
import SVGDialog from "@/ui/components/components/SVGDialog.vue";
import SVGGradient from "@/ui/components/components/SVGGradient.vue";
import SVGTolltip from "@/ui/components/components/SVGTooltip.vue";
import LabelUnitWrapper from "@/ui/components/devices/components/LabelUnitWrapper.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import OutputSlotBase from "@/ui/components/devices/devices/base/OutputSlotBase.vue";
import SSPDetails from "@/ui/components/devices/devices/SSPDetails.vue";
import SSPOutputControls from "@/ui/components/devices/devices/SSPOutputControls.vue";
import DefaultDeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import EfficientIODialog from "@/ui/components/modals/EfficientIODialog.vue";

const tab = ref(0);

const store = useStore();

const measurementState = computed(() => (store.state as RootState).measurements);

function existMappingAndIsNotZero(mapping: string) {
  if (!props.deviceData.data.mappings[mapping] || props.deviceData.data.mappings[mapping] == "")
    return false;
  const value = measurementState.value.measurements.get(props.deviceData.data.mappings[mapping]);

  return value && value != 0;
}

const hasECharger = computed(() => existMappingAndIsNotZero("OutputECharger_actualValue"));
const isEChargerEnabled = computed(() => existMappingAndIsNotZero("OutputECharger_state"));
const hasInput = computed(() => existMappingAndIsNotZero("InputOutside_actualValue"));
const hasPV = computed(() => existMappingAndIsNotZero("InputPV_actualValue"));
const hasBattery = computed(() => existMappingAndIsNotZero("InputBattery_actualValue"));
const has32A1 = computed(() => existMappingAndIsNotZero("Output32A1_actualValue"));
const is32A1Enabled = computed(() => existMappingAndIsNotZero("Output32A1_state"));
const has32A2 = computed(() => existMappingAndIsNotZero("Output32A2_actualValue"));
const is32A2Enabled = computed(() => existMappingAndIsNotZero("Output32A2_state"));
const has16A = computed(() => existMappingAndIsNotZero("Output16A_actualValue"));
const is16AEnabled = computed(() => existMappingAndIsNotZero("Output16A_state"));

// Properties
interface Props {
  deviceData: IDevice;
}

const props = withDefaults(defineProps<Props>(), {});

function toggleView() {
  if (tab.value == 0) {
    tab.value = 1;
  } else {
    tab.value = 0;
  }
}
</script>
