<template>
  <div style="display: flex; margin-top: 40px; justify-content: space-between">
    <div>{{ $t("mlModel.SetpointOptimizer.averageDescription") }}</div>
    <div>{{ averageOfRoomTemps }} °C</div>
  </div>
</template>

<script lang="ts">
import * as _ from "lodash";
import { defineComponent, PropType } from "vue";

import { IVariablesState } from "@/store/modules/measurements/types";
import { RootState } from "@/store/types";

export default defineComponent({
  components: {},
  props: {
    controls: Object as PropType<any>,
    roomTemperatures: { default: undefined, type: Object as PropType<any> },
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    measurements() {
      return this.measurementsState.measurements;
    },
    averageOfRoomTemps(): any {
      const valuesArray = this.roomTemperatures.map((element: any) => {
        const controlsObject = this.controls.room_temperatures[element];
        return this.measurements.get(controlsObject.variable);
      });
      return _.mean(valuesArray).toFixed(2);
    },
  },
});
</script>

<style lang="scss"></style>
