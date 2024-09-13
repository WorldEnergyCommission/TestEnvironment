<template>
  <DeviceLayout
    :device-data="deviceData"
    :is-charts="true"
    :is-m-p-c-layout="true"
    :show-event-variable="{}"
    device-icon="solar_panel"
    device-size="x2h"
    settings-modal-width="700"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="pv-monitoring-service">
        <div class="pv-monitoring-service-gauge-wrapper">
          <MonitoringGauge
            :device-data="deviceData"
            :input-variable="gaugeVariable"
            :is-preview="isPreview"
          />
        </div>
        <div class="pv-monitoring-service-actual">
          <div class="d-flex align-center justify-center">
            <span>{{ $t("mlModel.PVMonitoringService.mainView.pvPower") }}:</span>
            <span class="px-1">{{ powerActualValue }}</span>
            <span>kW</span>
          </div>
          <div class="d-flex align-center justify-center">
            <span>{{ $t("mlModel.PVMonitoringService.mainView.efficiency") }}:</span>
            <span class="px-1">{{ efficiencyActualValue }}</span>
            <span>%</span>
          </div>
          <div class="pv-monitoring-service-ready d-flex align-center justify-center pt-2">
            <ShowEventDotBase
              :items="[[1, $vuetify.theme.current.colors.green]]"
              :variable-data="readyMqtt"
              height="15"
              instance="ShowEventDot1"
              width="15"
              :is-preview="isPreview"
            />
            <span class="ml-2">{{ $t("mlModel.PVMonitoringService.mainView.service") }}</span>
          </div>
        </div>
      </div>
    </template>
    <template #settings-view>
      <CoreContainer>
        <InputFieldBase
          :field-rules="[
            rules.required,
            rules.fieldMoreThanNull,
            rules.twoComas,
            rules.fieldLessThan100,
          ]"
          :is-decimal="true"
          :max="100"
          :min="0"
          :step="0.1"
          :variable-data="inputFieldEfficiency"
          instance="InputField"
          :with-spacer="false"
          :input-colums="3"
          :input-field-styles="{ paddingInline: '1rem' }"
          :is-preview="isPreview"
        >
          <template #textDescription>
            {{ $t("mlModel.PVMonitoringService.settingsView.pvEfficiencyDecay") }}
          </template>
          <template #unit> %x </template>
        </InputFieldBase>
      </CoreContainer>
    </template>
    <template #charts-view>
      <MLModelLynusChartWrapper v-bind="{ ...chartData }" :is-preview="isPreview" />
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import { RootState } from "@/store/types";
import InputFieldBase from "@/ui/components/devices/devices/base/InputFieldBase.vue";
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import MLModelLynusChartWrapper from "@/ui/components/devices/mpc/components/MLModelLynusChartWrapper.vue";
import MonitoringGauge from "@/ui/components/devices/mpc/PVMonitoringService/MonitoringGauge.vue";
import { Validation } from "@/ui/mixins/validation";

/**
 * Component that represent PVMonitoringService MPC device
 */
export default defineComponent({
  name: "PVMonitoringService",
  components: {
    MonitoringGauge,
    ShowEventDotBase,
    InputFieldBase,
    MLModelLynusChartWrapper,
    DeviceLayout,
  },
  mixins: [Validation],
  props: {
    deviceData: { type: Object as PropType<IDevice>, required: true },
    isPreview: { default: false, type: Boolean },
  },
  data() {
    const mpc: any = null;

    return {
      mpc,
    };
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    measurements() {
      return this.measurementsState.measurements;
    },
    ready() {
      return this.deviceData?.data?.meta?.controllerMappings?.mpcReady;
    },
    power() {
      return this.deviceData?.data?.meta?.controllerMappings?.power;
    },
    deviceIdUnderline() {
      const deviceId = this.deviceData.id;
      return deviceId.replace(/-/g, "_");
    },
    gaugeVariable() {
      return `PV.${this.deviceIdUnderline}.efficiency`;
    },
    settingsVariable() {
      return `PV.${this.deviceIdUnderline}.decay`;
    },
    inputFieldEfficiency() {
      return {
        InputField_targetValue: this.settingsVariable,
      };
    },
    efficiencyActualValue() {
      if (this.isPreview) {
        return Math.round(Math.random() * 100);
      }
      return this.measurements.get(this.gaugeVariable);
    },
    powerActualValue() {
      if (this.isPreview) {
        return (Math.random() * 100).toFixed(2);
      }
      const val: any = this.measurements.get(this.power);
      return typeof val === "number" ? val.toFixed(2) : null;
    },
    /**
     * Prepares chart options object suitable for the chart component
     */
    chartData() {
      return {
        chartTitle: "",
        chartHeight: 550,
        chartWrapperHeight: 700,
        chartData: {
          name: "",
          data: {
            chartOptions: [
              {
                agg: "avg",
                name: "Efficiency",
                scaling: {
                  min: 0,
                  max: 100,
                },
                seriesType: "View",
                type: "line",
                unit: "%",
                var: this.gaugeVariable,
              },
            ],
            selectedStackingOptions: "normal",
            selectedWidth: "full",
            type: "chart",
          },
        },
        navigationItemsToExclude: ["live", "day"],
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
    fetchMPCData(mpcId: string): Promise<any> {
      return this.$store.dispatch("mpc/fetchMPCData", mpcId);
    },
  },
});
</script>

<style lang="scss">
.pv-monitoring-service {
  height: 100%;
  display: flex;
  flex-direction: column;

  .pv-monitoring-service-gauge-wrapper {
    display: flex;
    height: 190px;
  }

  .pv-monitoring-service-actual {
    flex-grow: 1;
    font-size: 15px;

    .pv-monitoring-service-ready {
      font-size: 10px;
    }
  }
}
</style>
