<template>
  <div>
    <CoreContainer fluid>
      <CoreRow>
        <CoreColumn
          v-for="(item, index) in mpcDevices"
          :key="index"
          :lg="item.lg"
          :md="item.md"
          :sm="item.sm"
          xs="12"
        >
          <component :is="item.component" />
        </CoreColumn>
      </CoreRow>
    </CoreContainer>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";

import CircleSpinner from "@/ui/components/components/CenteredCircleSpinner.vue";
import { envMPCDeviceList } from "@/utils/env";

const ConsumptionService = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/mpc/ConsumptionService/index.vue"),
  loadingComponent: CircleSpinner,
});
const EMS = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/mpc/EMS/index.vue"),
  loadingComponent: CircleSpinner,
});
const HeatingCircuitOptimization = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/mpc/HeatingCircuitOptimization/index.vue"),
  loadingComponent: CircleSpinner,
});
const PVMonitoringService = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/mpc/PVMonitoringService/index.vue"),
  loadingComponent: CircleSpinner,
});
const PVProductionService = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/mpc/PVProductionService/index.vue"),
  loadingComponent: CircleSpinner,
});
const SetpointOptimizer = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/mpc/SetpointOptimizer/index.vue"),
  loadingComponent: CircleSpinner,
});

export default defineComponent({
  components: {
    HeatingCircuitOptimization,
    PVProductionService,
    ConsumptionService,
    PVMonitoringService,
    SetpointOptimizer,
    EMS,
  },
  data() {
    return {
      mpcDevices: [
        {
          component: "HeatingCircuitOptimization",
          lg: "3",
          md: "6",
          sm: "12",
        },
        {
          component: "PVProductionService",
          lg: "3",
          md: "6",
          sm: "12",
        },
        {
          component: "ConsumptionService",
          lg: "3",
          md: "6",
          sm: "12",
        },
        {
          component: "PVMonitoringService",
          lg: "3",
          md: "6",
          sm: "12",
        },
        {
          component: "EMS",
          lg: "12",
          md: "12",
          sm: "12",
        },
        {
          component: "SetpointOptimizer",
          lg: "6",
          md: "12",
          sm: "12",
        },
      ].filter((element: any) => envMPCDeviceList.includes(element.component)),
    };
  },
});
</script>

<style lang="scss" scoped></style>
