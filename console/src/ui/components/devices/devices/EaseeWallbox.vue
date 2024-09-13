<template>
  <DefaultDeviceLayout
    :device-data="deviceData"
    device-icon="electric-charging-station"
    device-icon-size="0"
    device-size="x2h"
    :is-preview="isPreview"
    :preview-data="deviceData"
    :is-charts="true"
  >
    <template #custom-icon></template>
    <!-- UI Content -->
    <template #basic-controls>
      <!-- Output fields -->
      <CoreContainer class="w-100 h-100 d-flex align-center flex-column">
        <CoreRow>
          <!-- Values -->
          <CoreColumn cols="12">
            <!-- OP mode -->
            <CoreRow class="my-5">
              <lynus-icon :size="20" color="theme" name="electric-charging-station" class="mr-10" />
              <LabelUnitWrapper>
                <template #value>
                  <div
                    :style="{
                      backgroundColor: operationMode.color,
                      height: '15px',
                      width: '15px',
                      borderRadius: '50%',
                    }"
                    class="mt-1"
                  ></div>
                  <div class="pl-2">{{ operationMode.text }}</div>
                </template>
              </LabelUnitWrapper>
            </CoreRow>
            <!-- Current power -->
            <CoreTooltip>
              <template #activator="{ props: activatorProps }">
                <CoreRow class="my-5" v-bind="activatorProps">
                  <lynus-icon :size="20" color="theme" name="charging_power_3" class="mr-10" />
                  <LabelUnitWrapper>
                    <template #value>
                      <OutputFieldBase
                        :is-decimal="true"
                        :variable-data="mappings"
                        instance="currentPower"
                        :is-preview="isPreview"
                      />
                      <div class="pl-2">kW</div>
                    </template>
                  </LabelUnitWrapper>
                </CoreRow>
              </template>
              <p>{{ t("devices.EaseeWallbox.mappings.currentPower") }}</p>
            </CoreTooltip>
            <!-- Session energy -->
            <CoreTooltip>
              <template #activator="{ props: activatorProps }">
                <CoreRow class="my-5" v-bind="activatorProps">
                  <lynus-icon :size="20" color="theme" name="battery" class="mr-10" />
                  <LabelUnitWrapper>
                    <template #value>
                      <OutputFieldBase
                        :is-decimal="true"
                        :variable-data="mappings"
                        instance="sessionEnergy"
                        :is-preview="isPreview"
                      />
                      <div class="pl-2">kWh</div>
                    </template>
                  </LabelUnitWrapper>
                </CoreRow>
              </template>
              <p>{{ t("devices.EaseeWallbox.mappings.sessionEnergy") }}</p>
            </CoreTooltip>
            <!-- Lifetime energy -->
            <CoreTooltip>
              <template #activator="{ props: activatorProps }">
                <CoreRow class="my-5" v-bind="activatorProps">
                  <lynus-icon :size="20" color="theme" name="electricity" class="mr-10" />
                  <LabelUnitWrapper>
                    <template #value>
                      <OutputFieldBase
                        :is-decimal="true"
                        :variable-data="mappings"
                        instance="lifetimeEnergy"
                        :is-preview="isPreview"
                      />
                      <div class="pl-2">kWh</div>
                    </template>
                  </LabelUnitWrapper>
                </CoreRow>
              </template>
              <p>{{ t("devices.EaseeWallbox.mappings.lifetimeEnergy") }}</p>
            </CoreTooltip>
          </CoreColumn>
        </CoreRow>
      </CoreContainer>
    </template>
    <template #additional-actions>
      <EaseeWallboxInfoModal
        :device-name="deviceData.name"
        :project-id="project_id"
        :device-id="deviceData.id"
      />
    </template>
    <!-- Device Size -->
    <template #dnd>
      <slot name="dnd"></slot>
    </template>
    <template #charts-view>
      <CoreCard v-if="chartData" style="height: 30rem">
        <BaseChart :chart-data="chartData" />
      </CoreCard>
    </template>
    <template #settings-view></template>
  </DefaultDeviceLayout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";

import OutputFieldBase from "./base/OutputFieldBase.vue";
import { useCommonDevice } from "./DeviceBaseComposables";
import EaseeWallboxInfoModal from "./EaseeWallboxInfoModal.vue";
import BaseChart from "../charts/charts/BaseChart.vue";
import LabelUnitWrapper from "../components/LabelUnitWrapper.vue";
import DefaultDeviceLayout from "../layout/DefaultDeviceLayout.vue";
import { IDevice } from "@/store/modules/devices/types";

// Properties
interface Props {
  deviceData: IDevice;
  isPreview?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isPreview: false,
});

// Composables
const { t } = useI18n();
const { measurements } = useCommonDevice(props);

// Returns the UI operation mode label based on the actual value
const operationMode = computed(() => {
  switch (measurements.value.get(mappings.value.operationMode_actualValue)) {
    case 0:
      return { text: t("devices.EaseeWallbox.operationModes.offline"), color: "#808080" };
    case 1:
      return { text: t("devices.EaseeWallbox.operationModes.disconnected"), color: "#008000" };
    case 2:
      return { text: t("devices.EaseeWallbox.operationModes.awaitingStart"), color: "#ffff00" };
    case 3:
      return { text: t("devices.EaseeWallbox.operationModes.charging"), color: "#ffa500" };
    case 4:
      return { text: t("devices.EaseeWallbox.operationModes.completed"), color: "#ffff00" };
    case 5:
      return { text: t("devices.EaseeWallbox.operationModes.error"), color: "#ff0000" };
    case 6:
      return { text: t("devices.EaseeWallbox.operationModes.readyToCharge"), color: "#ffa500" };
    case 7:
      return {
        text: t("devices.EaseeWallbox.operationModes.awaitingAuthentication"),
        color: "#ffff00",
      };
    case 8:
      return { text: t("devices.EaseeWallbox.operationModes.deAuthenticating"), color: "#ffff00" };
    default:
      return { text: t("devices.EaseeWallbox.operationModes.unknown"), color: "#808080" };
  }
});

const store = useStore();
const chargerId = computed(() => props.deviceData.data.meta.chargerId);
const project_id = computed(() => (store.state as RootState).projects.project.id);

const mappings = computed(() => {
  return {
    operationMode_actualValue: `easee.${props.deviceData.data.meta.chargerId}.109`,
    currentPower_actualValue: `easee.${props.deviceData.data.meta.chargerId}.120`,
    sessionEnergy_actualValue: `easee.${props.deviceData.data.meta.chargerId}.121`,
    lifetimeEnergy_actualValue: `easee.${props.deviceData.data.meta.chargerId}.124`,
  };
});

const chartData = computed(() => {
  return {
    collection_id: props.deviceData.collection_id,
    created_at: props.deviceData.created_at.toString(),
    favorite: false,
    data: {
      chartOptions: [
        {
          seriesType: "View",
          agg: "avg",
          var: mappings.value.currentPower_actualValue,
          type: "line",
          unit: "kW",
          name: t("devices.EaseeWallbox.mappings.currentPower"),
          scaling: {
            min: 0,
            max: undefined,
          },
        },
        {
          seriesType: "View",
          agg: "avg",
          var: mappings.value.lifetimeEnergy_actualValue,
          type: "line",
          unit: "kWh",
          name: t("devices.EaseeWallbox.mappings.lifetimeEnergy"),
          scaling: {
            min: 0,
            max: undefined,
          },
        },
        {
          seriesType: "View",
          agg: "last",
          var: mappings.value.operationMode_actualValue,
          type: "line",
          unit: "",
          name: t("devices.EaseeWallbox.mappings.operationMode"),
          scaling: {
            min: 0,
            max: undefined,
          },
        },
        {
          seriesType: "View",
          agg: "avg",
          var: mappings.value.sessionEnergy_actualValue,
          type: "line",
          unit: "kWh",
          name: t("devices.EaseeWallbox.mappings.sessionEnergy"),
          scaling: {
            min: 0,
            max: undefined,
          },
        },
      ],
      type: "chart",
      periodName: "day",
      interval: "1h",
      selectedStackingOptions: undefined,
      selectedWidth: undefined,
    },
    id: props.deviceData.id,
    name: props.deviceData.name,
  };
});
</script>
