<template>
  <DeviceLayout
    :device-data="deviceData"
    :is-charts="true"
    :is-m-p-c-layout="true"
    :show-event-variable="errorWarningMqtt"
    device-icon="solar_panel"
    device-size="x2h"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="pv-production-service">
        <div class="field">
          <div :class="['label', { 'label-it': isITLocale }]">
            {{ $t(`${langPath}.mainView.actualPower`) }}
          </div>
          <div :class="['value', 'd-flex', { 'value-it': isITLocale }]">
            <OutputFieldBase
              :is-decimal="true"
              :max="2000"
              :min="-100"
              :variable-data="actualPowerMqtt"
              instance="OutputField1"
              :is-preview="isPreview"
            />
            <div class="ml-1">kW</div>
          </div>
        </div>
        <div class="field">
          <div :class="['label', { 'label-it': isITLocale }]">
            {{ $t(`${langPath}.mainView.calculatedPower`) }}
          </div>
          <div :class="['value', 'd-flex', { 'value-it': isITLocale }]">
            <OutputFieldBase
              :is-decimal="true"
              :max="2000"
              :min="-100"
              :variable-data="calculatedPowerMqtt"
              instance="OutputField2"
              :is-preview="isPreview"
            />
            <div class="ml-1">kW</div>
          </div>
        </div>
        <div class="field">
          <div :class="['label', { 'label-it': isITLocale }]">
            {{ $t(`${langPath}.mainView.calculatedEnergy`) }}
          </div>
          <div :class="['value', 'd-flex', { 'value-it': isITLocale }]">
            <OutputFieldBase
              :is-decimal="true"
              :max="2000"
              :min="-100"
              :variable-data="calculatedEnergyMqtt"
              instance="OutputField3"
              :is-preview="isPreview"
            />
            <div class="ml-1">kWh</div>
          </div>
        </div>
        <div class="field">
          <ShowEventDotBase
            :items="[[1, $vuetify.theme.current.colors.green]]"
            :variable-data="readyMqtt"
            height="15"
            instance="ShowEventDot1"
            width="15"
            :is-preview="isPreview"
          />
          <span class="ml-2">{{ $t(`${langPath}.mainView.service`) }}</span>
        </div>
      </div>
    </template>
    <template #charts-view>
      <div class="pv-production-charts-content">
        <SettingsCharts
          :charts-scaling="chartScaling"
          :mpc-id="mpcId"
          :is-preview="isPreview"
          :mqtt-charts-variables="{
            actualPower,
            calculatedPower,
            calculatedEnergy,
            producedEnergy,
          }"
        />
      </div>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import SettingsCharts from "@/ui/components/devices/mpc/PVProductionService/SettingsCharts/index.vue";

/**
 * Component that represent PVProductionService MPC device
 */
export default defineComponent({
  name: "PVPredictionService",
  components: {
    ShowEventDotBase,
    SettingsCharts,
    OutputFieldBase,
    DeviceLayout,
  },
  props: {
    deviceData: { type: Object as PropType<IDevice>, required: true },
    isPreview: { default: false, type: Boolean },
  },
  data() {
    const mpc: any = null;

    return {
      mpc,
      isSettingsView: false,
    };
  },
  computed: {
    isITLocale() {
      return this.$i18n.locale === "it";
    },
    langPath() {
      return `mlModel.${this.deviceData.data.type}`;
    },
    mpcId() {
      if (this.deviceData) return this.deviceData.id;
      return null;
    },
    mpcIdMod() {
      if (this.mpcId) return this.mpcId.replace(/-/g, "_");
      return null;
    },
    chartScaling() {
      return this.deviceData?.data?.meta.chartScaling;
    },
    ready() {
      return this.deviceData?.data?.meta?.controllerMappings?.mpcReady;
    },
    actualPower() {
      return this.deviceData?.data?.meta?.controllerMappings?.power;
    },
    calculatedPower() {
      return `PV.${this.mpcIdMod}.pow`;
    },
    calculatedPowerMainView() {
      return `PV.${this.mpcIdMod}.mean`;
    },
    calculatedEnergy() {
      return `PV.${this.mpcIdMod}.en`;
    },
    producedEnergy() {
      return `PV.${this.mpcIdMod}.cen`;
    },
    errorWarningMqtt() {
      return {
        ShowEvent_errorWarningState: this.deviceData?.data?.meta?.controllerMappings?.errorWarning,
      };
    },
    actualPowerMqtt() {
      return {
        OutputField1_actualValue: this.actualPower,
      };
    },
    calculatedPowerMqtt() {
      return {
        OutputField2_actualValue: this.calculatedPowerMainView,
      };
    },
    calculatedEnergyMqtt() {
      return {
        OutputField3_actualValue: this.calculatedEnergy,
      };
    },
    readyMqtt() {
      return {
        ShowEventDot1_errorWarningState: this.ready,
      };
    },
  },
  async mounted() {
    if (!this.isPreview) {
      this.mpc = await this.fetchMPCData(this.deviceData.id);
    }
  },
  methods: {
    switchSettingsView(setting: boolean) {
      this.isSettingsView = setting;
    },
    fetchMPCData(payload: any): any {
      return this.$store.dispatch("mpc/fetchMPCData", payload);
    },
  },
});
</script>

<style lang="scss">
.pv-production-service {
  .field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 20px;
    width: 100%;

    .label {
      width: 60%;
      font-size: 13px;
      text-align: right;
      padding-right: 5px;
    }

    .label-it {
      width: 68%;
      font-size: 12px;
    }

    .value {
      font-size: 15px;
      width: 40%;
      text-align: left;
    }

    .value-it {
      width: 32%;
    }

    &:last-of-type {
      justify-content: center;
      font-size: 12px;
      margin-top: 20px;
    }
  }
}

.pv-production-charts-content {
  min-height: 84dvh;
}
</style>
