<template>
  <ModuleLayout :module-data="deviceData">
    <EnergyFlowView :all-systems-data="systemsData" />
    <template #dnd>
      <slot name="dnd" />
    </template>
  </ModuleLayout>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { ModuleProperty, ModuleType } from "@/store/modules/modules/types";
import {
  SystemData,
  SystemTypeString,
} from "@/ui/components/devices/devices/EnergyViewDevice/EnergyViewSystems";
import ModuleLayout from "@/ui/components/devices/layout/ModuleLayout.vue";
import EnergyFlowView from "@/ui/components/devices/mpc/EMS/components/EnergyFlowView.vue";

const props = defineProps<{ deviceData: ModuleType }>();

// function to reshape data from module structure to energy flow view structure
function reshapeSystems(
  props: ModuleProperty[],
  filterName: string,
  systemsName: string,
): { count: number; components: Record<string, SystemData> } {
  const arr = props.filter((prop) => prop.name == filterName);
  const components = arr.reduce(
    (acc, value, currentIndex) => {
      return {
        ...acc,
        [`${systemsName}${currentIndex + 1}`]: {
          power: value.mappings["power"],
          error: value.mappings["error"],
          title: value.data_mapping_name,
          systemType: systemsName,
        } as SystemData,
      };
    },
    {} as Record<string, SystemData>,
  );
  return { count: arr.length, components };
}

function reshapeIfDefined(devData: ModuleType, filterName: string, systemsName: string) {
  if (!devData || !devData?.properties)
    return { count: 0, components: {} as Record<string, SystemData> };
  return reshapeSystems(props.deviceData?.properties, filterName, systemsName);
}

// use computed for systems data
const systemsData = computed(() => {
  const retObject: Record<
    SystemTypeString,
    { count: number; components: Record<string, SystemData> }
  > = {
    grid: reshapeIfDefined(props.deviceData, "Grid", "grid"),
    pvSystem: reshapeIfDefined(props.deviceData, "PV", "pvSystem"),
    generator: reshapeIfDefined(props.deviceData, "Generator", "generator"),
    heatProducer: reshapeIfDefined(props.deviceData, "heatProducer", "heatProducer"),
    battery: reshapeIfDefined(props.deviceData, "Battery", "battery"),
    houseConsumption: reshapeIfDefined(props.deviceData, "House", "houseConsumption"),
    evChargingStation: reshapeIfDefined(props.deviceData, "EVChargingStation", "evChargingStation"),
    electricHeating: reshapeIfDefined(props.deviceData, "electricHeating", "electricHeating"),
    heatingPump: reshapeIfDefined(props.deviceData, "heatingPump", "heatingPump"),
    otherBigConsumer: reshapeIfDefined(props.deviceData, "otherBigConsumer", "otherBigConsumer"),
    heatMeter: reshapeIfDefined(props.deviceData, "heatMeter", "heatMeter"),
  };
  return retObject;
});
</script>
