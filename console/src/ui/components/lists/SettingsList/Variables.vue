<template>
  <CoreCard class="def-settings">
    <div class="def-settings-title mb-5">
      {{ $t("uiComponents.settings.variables.title") }}
    </div>
    <div style="display: flex">
      <Measurements style="width: 100%" />
    </div>
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Measurements from "@/ui/views/Project/Measurements.vue";

/**
 * Component that shows Variables settings tab
 */
export default defineComponent({
  components: {
    Measurements,
  },
});
</script>

<style lang="scss" scoped>
.def-settings {
  .def-settings-title {
    font-size: 20px;
    line-height: 1;
  }
}
</style>
