<template>
  <DeviceLayout
    :is-charts="true"
    :is-m-p-c-layout="true"
    :is-preview="isPreview"
    :device-data="deviceData"
    :preview-data="deviceData"
    :show-event-variable="showEventGeneralErrorWarning"
    device-size="x5h"
    device-icon="temperature"
    settings-modal-width="700"
    @rerender-device="rerenderDevice"
  >
    <template #basic-controls>
      <div class="setpoint-optimizer d-flex flex-column justify-center">
        <MainView
          v-if="allSystems"
          :mpc-id="mpc.id"
          :is-preview="isPreview"
          :systems-data="allSystems"
          :forecast-data="predictedSetpoint"
          @handle-update-m-p-c="rerenderDevice"
        />
        <div class="d-flex align-center justify-center">
          <div class="pr-2">
            {{ $t("mlModel.SetpointOptimizer.mainView.serviceReady") }}
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
      </div>
    </template>
    <template #charts-view>
      <div>
        <SetpointOptimizerCharts v-if="mpc" :all-device-data="mpc" :is-preview="isPreview" />
      </div>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
    <template #settings-view>
      <SettingsSPO :device-data="deviceData" @updated="rerenderDevice" />
    </template>
  </DeviceLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";

import SettingsSPO from "./components/SettingsSPO.vue";
import { IDevice } from "@/store/modules/devices/types";
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import SetpointOptimizerCharts from "@/ui/components/devices/mpc/SetpointOptimizer/charts/index.vue";
import MainView from "@/ui/components/devices/mpc/SetpointOptimizer/MainView.vue";
import forecastMockData from "@/ui/components/devices/previews/mpc/SetpointOptimizer/forecastMockData";

// Properties
interface Props {
  deviceData: IDevice;
  isPreview: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isPreview: false,
});

// Constants
const store = useStore();
const mpc = ref<any>(null);

// Computed Properties
/**
 * Gets all systems from Setpoint Optimizer controllerMappings
 * @return {object|null} collection of systems
 */
const allSystems = computed(() => {
  if (mpc.value === null) {
    return;
  }

  const {
    heating_air_systems,
    heating_water_systems,
    cooling_air_systems,
    cooling_water_systems,
    hybrid_water_systems,
    hybrid_air_systems,
  } = mpc.value.data.meta?.controllerMappings as any;

  return {
    heating_air_systems,
    heating_water_systems,
    cooling_air_systems,
    cooling_water_systems,
    hybrid_water_systems,
    hybrid_air_systems,
  };
});

const predictedSetpoint = computed(() => {
  if (!mpc.value.data) {
    return null;
  }

  return mpc.value.data.meta?.charts.predictedSetpoint;
});

const showEventDotServiceReady = computed(() => {
  return {
    ShowEventDot_errorWarningState: mpc.value?.data?.meta?.controllerMappings?.mpcReady,
  };
});

const showEventGeneralErrorWarning = computed(() => {
  return {
    ShowEvent_errorWarningState: mpc.value?.data?.meta?.controllerMappings?.errorWarning,
  };
});

// Funtions
const rerenderDevice = async () => {
  if (props.isPreview) {
    mpc.value = await fetchMPCData(props.deviceData.id);
  }
};

const fetchMPCData = (mpcId: string): Promise<any> => {
  return store.dispatch("mpc/fetchMPCData", mpcId);
};

watch(
  () => props.isPreview,
  async () => {
    if (!props.isPreview) {
      mpc.value = await fetchMPCData(props.deviceData.id);
    } else {
      mpc.value = {
        data: {
          meta: {
            controllerMappings: {
              heating_air_systems: {
                components: {
                  heating_air_systems1: {
                    room_temperatures: [
                      {
                        title: "room",
                        variable: "variable",
                      },
                    ],
                  },
                },
                count: 1,
              },
              heating_water_systems: {
                components: {
                  heating_water_systems1: {
                    room_temperatures: [
                      {
                        title: "room",
                        variable: "variable",
                      },
                    ],
                  },
                },
                count: 1,
              },
              cooling_air_systems: {
                components: {
                  cooling_air_systems1: {
                    room_temperatures: [
                      {
                        title: "room",
                        variable: "variable",
                      },
                    ],
                  },
                },
                count: 1,
              },
              cooling_water_systems: {
                components: {
                  cooling_water_systems1: {
                    room_temperatures: [
                      {
                        title: "room",
                        variable: "variable",
                      },
                    ],
                  },
                },
                count: 1,
              },
              hybrid_water_systems: {
                components: {
                  hybrid_water_systems1: {
                    room_temperatures: [
                      {
                        title: "room",
                        variable: "variable",
                      },
                    ],
                    max_flow_temperature: {
                      heating: 30,
                      cooling: 30,
                    },
                    min_flow_temperature: {
                      heating: 18,
                      cooling: 18,
                    },
                    set_point_temperature: {
                      heating: 23,
                      cooling: 23,
                    },
                  },
                },
                count: 1,
              },
              hybrid_air_systems: {
                components: {
                  hybrid_air_systems1: {
                    room_temperatures: [
                      {
                        title: "room",
                        variable: "variable",
                      },
                    ],
                    max_flow_temperature: {
                      heating: 30,
                      cooling: 30,
                    },
                    min_flow_temperature: {
                      heating: 18,
                      cooling: 18,
                    },
                    set_point_temperature: {
                      heating: 23,
                      cooling: 23,
                    },
                  },
                },
                count: 1,
              },
            },
            charts: {
              predictedSetpoint: forecastMockData,
            },
          },
        },
      };
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
.setpoint-optimizer {
  height: 100%;
}
</style>
