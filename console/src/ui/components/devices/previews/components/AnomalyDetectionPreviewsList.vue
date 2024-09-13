<template>
  <div>
    <CoreContainer fluid>
      <CoreRow>
        <CoreColumn
          v-for="(item, index) in aimlDevices"
          :key="index"
          lg="6"
          md="12"
          sm="12"
          xs="12"
        >
          <component :is="item" />
        </CoreColumn>
      </CoreRow>
    </CoreContainer>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";

import CircleSpinner from "@/ui/components/components/CenteredCircleSpinner.vue";

const HistoryAnomalyDetection = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/aiml/HistoryAnomalyDetection.vue"),
  loadingComponent: CircleSpinner,
});
const StreamAnomalyDetection = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/aiml/StreamAnomalyDetection.vue"),
  loadingComponent: CircleSpinner,
});

export default defineComponent({
  components: {
    StreamAnomalyDetection,
    HistoryAnomalyDetection,
  },
  data() {
    return {
      aimlDevices: ["StreamAnomalyDetection", "HistoryAnomalyDetection"],
    };
  },
});
</script>

<style lang="scss" scoped></style>
