<template>
  <EnergyViewLayout
    :is-charts="true"
    :is-m-p-c-layout="true"
    :is-preview="isPreview"
    :preview-data="deviceData"
    :device-data="deviceData"
    :show-event-variable="showEventGeneralErrorWarning"
    device-size="x5h"
    charts-modal-width="1750"
    device-icon="energy_view"
    settings-modal-width="1200"
    @rerender-device="rerenderDevice"
  >
    <template #basic-controls>
      <div class="ems-basic-controls" :style="height">
        <CoreRow v-if="allSystems" style="height: 100%">
          <CoreColumn cols="12" md="6" class="d-flex flex-column">
            <div class="align-self-center">
              {{ $t("mlModel.EMS.mainView.actualView") }}
            </div>
            <EnergyFlowView
              :is-e-m-s="true"
              :is-preview="isPreview"
              :wrapper-type="'Actual'"
              :all-systems-data="allSystems"
            />
            <div class="d-flex align-center justify-center">
              <div class="pr-2">
                {{ $t("mlModel.EMS.mainView.serviceReady") }}
              </div>
              <ShowEventDotBase
                width="15"
                height="15"
                instance="ShowEventDot"
                :is-preview="isPreview"
                :variable-data="showEventDotServiceReady"
                :items="[[1, $vuetify.theme.current.colors.green]]"
              />
            </div>
          </CoreColumn>
          <CoreColumn cols="12" md="6" class="d-flex flex-column">
            <div class="align-self-center">
              {{ $t("mlModel.EMS.mainView.forecastView") }}
            </div>
            <EnergyFlowView
              :is-e-m-s="true"
              :is-preview="isPreview"
              :wrapper-type="'Forecast'"
              :all-systems-data="allSystems"
              :group-slider-state="groupSlider"
              :battery-predicted-s-o-c="predictedSOC"
              :all-systems-forecast-data="predictedPower"
              :all-systems-forecast-target-power="predictedTargetPower"
            />
            <TimeSlider v-model="groupSlider" :items="timeSliderInitArray" />
          </CoreColumn>
        </CoreRow>
        <div v-else class="loader-wrapper">
          <CircleSpinner :size="60" color="accent" />
        </div>
      </div>
    </template>
    <template #charts-view>
      <EMSCharts
        :mpc-data="mpc"
        :mpc-id="mpcIdMod"
        :scaling="emsScaling"
        :is-preview="isPreview"
        :predicted-s-o-c="predictedSOC"
        :predicted-power="predictedPower"
        :predicted-energy="predictedEnergy"
        :predicted-target-power="predictedTargetPower"
      />
    </template>
    <template #settings-view>
      <SettingsEMS
        :mpc-data="mpc"
        :is-preview="isPreview"
        :device-data="deviceData"
        @rerender-device="rerenderDevice"
      />
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </EnergyViewLayout>
</template>

<script setup lang="ts">
import { ComputedRef, onMounted, ref, computed } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import { useStore } from "vuex";

import EnergyFlowView from "./components/EnergyFlowView.vue";
import { EMSSystemType } from "../../devices/EnergyViewDevice/EnergyViewSystems";
import { IDevice } from "@/store/modules/devices/types";
import CircleSpinner from "@/ui/components/components/CenteredCircleSpinner.vue";
import TimeSlider from "@/ui/components/devices/components/EnergyParts/TimeSlider.vue";
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import EnergyViewLayout from "@/ui/components/devices/layout/EnergyViewLayout.vue";
import EMSCharts from "@/ui/components/devices/mpc/EMS/components/charts/index.vue";
import SettingsEMS from "@/ui/components/devices/mpc/EMS/components/SettingsEMS.vue";
import forecastMockData from "@/ui/components/devices/previews/mpc/EMS/forecastMockData";
import CoreColumn from "@/ui/core/components/column/Column.vue";
import CoreRow from "@/ui/core/components/row/Row.vue";

// Properties
interface Props {
  deviceData: IDevice;
  isPreview?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isPreview: false,
});

// Constants
const store = useStore();
const mpc = ref<any>(null);
const groupSlider = ref(0);
const { name } = useDisplay();

// Computed Properties
/**
 * Gets all systems from EMS controllerMappings
 * @return {object|null} collection of systems as a reference
 */
const allSystems: ComputedRef<Record<EMSSystemType, any> | null> = computed(() => {
  if (mpc.value?.data?.meta?.controllerMappings) {
    const {
      pv,
      generator,
      grid,
      battery,
      house,
      charge_station,
      electric_heating,
      heating_pump,
      big_consumer,
    } = mpc.value.data.meta.controllerMappings;
    return {
      pv,
      generator,
      grid,
      battery,
      house,
      charge_station,
      electric_heating,
      heating_pump,
      big_consumer,
    };
  } else {
    return null;
  }
});
const predictedTargetPower = computed(() => {
  if (mpc.value?.data?.meta?.charts?.predictedTargetPower)
    return mpc.value.data.meta.charts.predictedTargetPower;
  else return null;
});
const predictedPower: ComputedRef<Record<string, any[]> | null> = computed(() => {
  if (mpc.value?.data?.meta?.charts?.predictedPower)
    return mpc.value.data.meta.charts.predictedPower;
  else return null;
});
const predictedEnergy = computed(() => {
  if (mpc.value?.data?.meta?.charts?.predictedEnergy)
    return mpc.value.data.meta.charts.predictedEnergy;
  else return null;
});
const predictedSOC = computed(() => {
  if (mpc.value?.data?.meta?.charts?.predictedSOC) {
    return mpc.value.data.meta.charts.predictedSOC;
  } else {
    return null;
  }
});
const emsScaling = computed(() => {
  return mpc.value.data.meta.scaling;
});
/**
 * Gets timestamps from EMS predictedPower
 * @return {array} list of timestamps
 */
const timeSliderInitArray = computed(() => {
  if (predictedPower.value) {
    return Object.values(predictedPower.value)[0];
  }
  return [];
});
// Convert MPC id from "id-id-id" to "id_id_id"
const mpcIdMod = computed(() => {
  if (props.deviceData.id) {
    return props.deviceData.id.replace(/-/g, "_");
  }
  return null;
});
const showEventDotServiceReady = computed(() => {
  return {
    ShowEventDot_errorWarningState: mpc.value.data.meta.controllerMappings.mpcReady,
  };
});
const showEventGeneralErrorWarning = computed(() => {
  return {
    ShowEvent_errorWarningState: mpc.value?.data?.meta?.controllerMappings?.errorWarning,
  };
});
const height = computed(() => {
  switch (name.value) {
    case "xs":
      return "height: 50rem";
    case "sm":
      return "height: 70rem";
    case "md":
      return "height: 35rem";
    case "lg":
      return "height: 40rem";
    case "xl":
      return "height: 45rem";
    case "xxl":
      return "height: 35rem";
    default:
      return "";
  }
});

// Functions
const rerenderDevice = async () => {
  mpc.value = null;
  mpc.value = await fetchMPCData(props.deviceData.id);
};
const fetchMPCData = (payload: any) => {
  return store.dispatch("mpc/fetchMPCData", payload);
};

// Lifecycle Hooks
onMounted(async () => {
  if (!props.isPreview) {
    mpc.value = await fetchMPCData(props.deviceData.id);
  } else {
    mpc.value = {
      data: {
        meta: {
          controllerMappings: {
            pv: {
              components: {
                pv1: {
                  power: "pvPower",
                  systemType: "pvSystem",
                  title: "Title",
                  interval: undefined,
                  error: "",
                },
              },
              count: 1,
            },
            generator: {
              components: {
                generator1: {
                  power: "generatorPower",
                  state_generator: "generatorState",
                  enable_soc: "generatorEnable",
                  disable_soc: "generatorDisable",
                  switch_enable: "generatorSwitchEnable",
                  state_enable: "generatorStateEnable",
                  switch_reset: "generatorSwitchReset",
                  state_reset: "generatorStateReset",
                  systemType: "generator",
                  title: "Title",
                  interval: undefined,
                  error: "",
                },
              },
              count: 1,
            },
            grid: {
              components: {
                grid1: {
                  power: "gridPower",
                  size: "gridSize",
                  systemType: "grid",
                  title: "Title",
                  interval: undefined,
                  error: "",
                },
              },
              count: 1,
            },
            battery: {
              components: {
                battery1: {
                  power: "batteryPower",
                  systemType: "battery",
                  switch_enable: "batterySwitchEnable",
                  state_enable: "batteryStateEnable",
                  switch_reset: "batterySwitchReset",
                  state_reset: "batteryStateReset",
                  soc: "batterySoc",
                  capacity: "batteryCapacity",
                  target_power: "batteryTargetPower",
                  priority: "batteryPriority",
                  size_capacity: "batterySizeCapacity",
                  title: "Title",
                  interval: undefined,
                  error: "",
                  soc_range_max: "",
                  soc_range_min: "",
                  state_soc_range_max: "",
                  state_soc_range_min: "",
                  battery_standby_optimization_state: "",
                  battery_standby_optimization_mode: "",
                  battery_standby_optimization_time_on: "",
                  battery_standby_optimization_time_off: "",
                  battery_standby_optimization_power_on: "",
                  battery_standby_optimization_power_off: "",
                },
              },
              count: 1,
            },
            house: {
              components: {
                house1: {
                  power: "housePower",
                  systemType: "house",
                  switch_enable: "houseSwitchEnable",
                  state_enable: "houseStateEnable",
                  title: "Title",
                  interval: undefined,
                  error: "",
                },
              },
              count: 1,
            },
            charge_station: {
              components: {
                charge_station1: {
                  power: "chargeStationPower",
                  error: "",
                  title: "chargeStationTitle",
                  car_connected: "chargeStationCarConnected",
                  charging_time: "chargeStationChargingTime",
                  state_charging_station: "chargeStationStateChargingStation",
                  state_emergency: "chargeStationStateEmergency",
                  state_manual: "chargeStationStateManual",
                  min_power: "chargeStationMin",
                  switch_emergency: "chargeStationSwitch",
                  priority: "chargeStationPriority",
                  enable_soc: "chargeStationEnable",
                  disable_soc: "chargeStationDisable",
                  max_power: "chargeStationMax",
                  slider_manual: "chargeStationSliderManual",
                  slider_target_power: "chargeStationTargetPower",
                  slider_min_power: "chargeStationSliderMin",
                  target_power: "chargeStationTargetPower",
                  state_enable: "chargeStationStateEnable",
                  switch_enable: "chargeStationSwitchEnable",
                  switch_manual: "chargeStationSwitchManual",
                  systemType: "charge_station",
                },
              },
              count: 1,
            },
            electric_heating: {
              components: {
                electric_heating1: {
                  power: "electricHeatingPower",
                  systemType: "electric_heating",
                  temperature: "electricHeatingTemperature",
                  target_power: "electricHeatingTargetPower",
                  state_electric_heating: "electricHeatingState",
                  switch_manual: "electricHeatingSwitchManual",
                  state_manual: "electricHeatingStateManual",
                  switch_emergency: "electricHeatingSwitchEmergency",
                  state_time: "electricHeatingStateEmergency",
                  switch_disable_protection: "electricHeatingSwitchDisable",
                  state_disable_protection: "electricHeatingStateDisable",
                  switch_enable: "electricHeatingSwitchEnable",
                  state_enable: "electricHeatingStateEnable",
                  slider_target_power: "electricHeatingSliderTargetPower",
                  slider_manual: "electricHeatingSlider",
                  max_power: {
                    heating: "electricHeatingMaxPower",
                  },
                  hour_on: "electricHeatingHourOn",
                  minute_on: "electricHeatingMinuteOn",
                  hour_off: "electricHeatingHourOff",
                  minute_off: "electricHeatingMinuteOff",
                  target_temp_on: "electricHeatingTempOn",
                  target_temp_off: "electricHeatingTempOff",
                  target_temp_max: "electricHeatingTempMax",
                  enable_soc: "electricHeatingEnable",
                  disable_soc: "electricHeatingDisable",
                  priority: "electricHeatingPriority",
                  title: "Title",
                  interval: undefined,
                  error: "",
                },
              },
              count: 1,
            },
            heating_pump: {
              components: {
                heating_pump1: {
                  power: "heatingPumpPower",
                  systemType: "heating_pump",
                  flow_temperature: "heatingPumpFlow",
                  return_temperature: "heatingPumpReturn",
                  inlet_temperature: "heatingPumpInlet",
                  outlet_temperature: "heatingPumpOutlet",
                  boiler_temperature: "heatingPumpBoiler",
                  boiler_water_temperature: "heatingPumpBoilerWater",
                  target_power: "heatingPumpTargetPower",
                  state_heating_pump: "heatingPumpState",
                  switch_manual: "heatingPumpSwitchManual",
                  state_manual: "heatingPumpStateManual",
                  switch_emergency: "heatingPumpSwitchEmergency",
                  state_emergency: "heatingPumpStateEmergency",
                  switch_time: "heatingPumpSwitchTime",
                  state_time: "heatingPumpStateTime",
                  switch_enable: "heatingPumpSwitchEnable",
                  state_enable: "heatingPumpStateEnable",
                  switch_reset: "heatingPumpSwichReset",
                  state_reset: "heatingPumpStateReset",
                  manual_power: "heatingPumpManualPower",
                  slider_manual: "heatingPumpSliderManual",
                  state_time_power: "heatingPumpStateTimePower",
                  slider_power: "heatingPumpSliderPower",
                  max_power: {
                    heating: "heatingPumpMaxPower",
                  },
                  hour_on: "heatingPumpHourOn",
                  minute_on: "heatingPumpMinuteOn",
                  hour_off: "heatingPumpHourOff",
                  minute_off: "heatingPumpMinuteOff",
                  priority: "heatingPumpPririty",
                  enable_soc: "heatingPumpEnable",
                  disable_soc: "heatingPumpDisable",
                  title: "Title",
                  interval: undefined,
                  error: "",
                },
              },
              count: 1,
            },
            big_consumer: {
              components: {
                big_consumer1: {
                  power: "bigConsumerPower",
                  systemType: "big_consumer",
                  switch_manual: "bigConsumerSwitchManual",
                  state_manual: "bigConsumerStateManual",
                  switch_emergency: "bigConsumerSwitchEmergency",
                  state_emergency: "bigConsumerStateEmergency",
                  switch_enable: "bigConsumerSwitchEnable",
                  state_enable: "bigConsumerStateEnable",
                  slider_target_power: "bigConsumerSliderTarget",
                  slider_manual: "bigConsumerSliderManual",
                  target_power: "bigConsumerTargetPower",
                  state_consumer: "bigConsumerStateConsumer",
                  priority: "bigConsumerPriority",
                  enable_soc: "bigConsumerEnableSoc",
                  disable_soc: "bigConsumerDisableSoc",
                  max_power: "bigConsumerMax",
                  title: "Title",
                  interval: undefined,
                  error: "",
                },
              },
              count: 1,
            },
            state_enable_ems: "emsStateEnable",
            enable_ems: "emsEnable",
            operation_mode: "emsOperation",
            message: "emsMessage",
            size_main_fuse: "emsSize",
            max_depth: "emsMax",
            reserve_battery: "emsReserve",
            adaptive_self_consumption: "emsAdaptiveSelfConsumption",
            min_charge_battery: "emsMin",
            reserve_charge: "emsReserveCharge",
            update_time: "emsUpdate",
            allow_charging_button: "emsAllowButton",
            allow_charging_state: "emsAllowState",
            activate_main_fuse: "emsActivate",
            state_main_fuse: "emsStateMain",
          },
          charts: {
            predictedPower: forecastMockData,
            predictedEnergy: forecastMockData,
            predictedTargetPower: forecastMockData,
            predictedSOC: forecastMockData,
          },
        },
      },
    };
  }
});
</script>

<style lang="scss" scoped>
@import "./src/ui/scss/variables";

.ems-basic-controls {
  .device-basic-controls-wrapper {
    padding: 10px 40px;
    height: 100%;
    display: flex;
    @media all and (max-width: 1264px) {
      flex-direction: column;
      padding: 10px 0;
    }

    .view-title {
      text-align: center;
      font-size: 20px;
    }

    .actual-view-wrapper {
      flex-grow: 1;
    }

    .forecast-view-wrapper {
      flex-grow: 1;
    }
  }
}
</style>
