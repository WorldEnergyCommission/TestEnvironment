<template>
  <DeviceLayout
    :device-data="deviceData"
    :is-charts="true"
    device-icon="energy_view"
    device-size="x5h"
    :preview-data="deviceData"
    :is-preview="isPreview"
  >
    <template #basic-controls>
      <EnergyFlowView :all-systems-data="allSystemsData" :is-preview="isPreview" />
    </template>
    <template #charts-view>
      <ChartWindowEnergyView
        :meta-data="deviceData.data.meta"
        :variable-data="deviceData.data.mappings"
        :is-preview="isPreview"
      />
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { SystemData, SystemTypeString, isDeviceTypeString } from "./EnergyViewSystems";
import { IDevice } from "@/store/modules/devices/types";
import ChartWindowEnergyView from "@/ui/components/devices/devices/EnergyViewDevice/components/ChartWindowEnergyView.vue";
import DeviceLayout from "@/ui/components/devices/layout/EnergyViewLayout.vue";
import EnergyFlowView from "@/ui/components/devices/mpc/EMS/components/EnergyFlowView.vue";

interface Systems {
  components?: Record<string, SystemData>;
  count: number;
}

export default defineComponent({
  components: {
    DeviceLayout,
    EnergyFlowView,
    ChartWindowEnergyView,
  },
  props: {
    deviceData: {
      type: Object as PropType<IDevice>,
    },
    isPreview: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    titleMappings(): Map<string, string> {
      return new Map<string, string>(
        this.deviceData!.data.meta?.titleMapping?.map((mapping: { key: string; value: string }) => {
          mapping.key = mapping.key.replace(/_Title/g, "");
          return Object.values(mapping);
        }),
      );
    },
    allSystemsData() {
      const data: Record<SystemTypeString, Systems> = {
        pvSystem: { count: 0 },
        generator: { count: 0 },
        heatProducer: { count: 0 },
        grid: { count: 0 },
        battery: { count: 0 },
        houseConsumption: { count: 0 },
        evChargingStation: { count: 0 },
        electricHeating: { count: 0 },
        heatingPump: { count: 0 },
        otherBigConsumer: { count: 0 },
        heatMeter: { count: 0 },
      };

      // example of mappings object:
      // {
      // "battery1_actualValue": "GVL.location_lat",
      // "battery1_socValue": "soc_test",
      // "electricHeating1_actualValue": "GVL.location_lat",
      // "evChargingStation1_actualValue": "test"
      // }
      Object.entries(this.deviceData!.data.mappings).forEach((element: any) => {
        const fullMappingName = element[0];
        const systemPower: string = element[1];
        const baseNameWithNumber: string = fullMappingName.split("_")[0];
        const baseName: string = baseNameWithNumber.replace(/[0-9]/g, "");

        // along with the device variables, also error variables are passed, which we don't want to process
        if (!isDeviceTypeString(baseName)) {
          return;
        }

        if (!data[baseName as SystemTypeString].components) {
          data[baseName as SystemTypeString].components = {};
        }

        // Due to weird mapping structure we need to parse battery soc value out of order and set it along its actual power
        // ["battery2_actualValue", "weather.8c3105ab_f1cc_43ab_bfbc_2d74e2bc19c6.nr"]
        // ["battery2_socValue", "weather.8c3105ab_f1cc_43ab_bfbc_2d74e2bc19c6.gh"]
        // ["electricHeating1_actualValue", "1101115183.STMP"]
        const containsBatterySocValue =
          baseName === "battery" && fullMappingName.includes("socValue");
        if (containsBatterySocValue) {
          if (containsBatterySocValue) {
            data[baseName as SystemTypeString].components![baseNameWithNumber].soc = systemPower;
            return;
          }
        }

        data[baseName as SystemTypeString].components![baseNameWithNumber] = {
          error: "",
          power: systemPower,
          title: this.titleMappings.get(baseNameWithNumber) ?? "",
          systemType: baseName as SystemTypeString,
          interval: this.deviceData!.data.meta?.intervals?.[baseNameWithNumber],
        };
        data[baseName as SystemTypeString].count++;
      });

      // add dummy heat producer bubble if heat consumers are mapped
      if (data.heatMeter.count) {
        if (!data.heatProducer.components) {
          data.heatProducer.components = {};
        }
        data.heatProducer.components.dummy = {
          error: "",
          power: "",
          title: "Heat producer",
          systemType: "heatProducer" as SystemTypeString,
          interval: "1h",
        };
        data.heatProducer.count++;
      }

      return data;
    },
  },
});
</script>

<style lang="scss"></style>
