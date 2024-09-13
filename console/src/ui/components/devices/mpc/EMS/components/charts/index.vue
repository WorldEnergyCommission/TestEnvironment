<template>
  <EMSChartWindow :items="items">
    <template #default="{ tab }">
      <component
        :is="items[tab].view"
        :mpc-id="mpcId"
        :predicted-energy="predictedEnergy"
        :predicted-power="predictedPower"
        :predicted-target-power="predictedTargetPower"
        :predicted-s-o-c="predictedSOC"
        :scaling="scaling"
        :systems-mappings="systemsMappings"
        :is-preview="isPreview"
      />
    </template>
  </EMSChartWindow>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import ChartDifference from "@/ui/components/devices/mpc/EMS/components/charts/ChartDifference.vue";
import ChartProdCons from "@/ui/components/devices/mpc/EMS/components/charts/ChartProdCons.vue";
import ChartTimetableConsumer from "@/ui/components/devices/mpc/EMS/components/charts/ChartTimetableConsumer.vue";
import EMSChartWindow from "@/ui/components/devices/mpc/EMS/components/charts/ChartWindow.vue";
import Forecast from "@/ui/components/devices/mpc/EMS/components/charts/Forecast/index.vue";

/**
 * Component that represent wrapper for charts tabs navigation.
 * Used in EMS.
 */
export default defineComponent({
  components: {
    EMSChartWindow,
    ChartDifference,
    ChartTimetableConsumer,
    ChartProdCons,
    Forecast,
  },
  props: {
    mpcData: Object as PropType<any>,
    predictedPower: Object as PropType<any>,
    predictedTargetPower: Object as PropType<any>,
    predictedEnergy: Object as PropType<any>,
    predictedSOC: Object as PropType<any>,
    mpcId: [Object, String],
    scaling: {
      type: Object as PropType<any>,
      required: true,
    },
    isPreview: { default: false, type: Boolean },
  },
  data() {
    return {
      tab: null,
    };
  },
  computed: {
    items() {
      return [
        {
          title: this.$t("mlModel.EMS.charts.chartProdConst.title"),
          view: "ChartProdCons",
        },
        {
          title: this.$t("mlModel.EMS.charts.chartDifference.title"),
          view: "ChartDifference",
        },
        {
          title: this.$t("mlModel.EMS.charts.chartTimeTableConsumer.title"),
          view: "ChartTimetableConsumer",
        },
        {
          title: this.$t("mlModel.EMS.charts.forecast.title"),
          view: "Forecast",
        },
      ];
    },
    /**
     * Gets all systems from controllerMappings
     * @return {object} collection of systems
     */
    systemsMappings() {
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
      } = this.mpcData.data.meta.controllerMappings;
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
    },
  },
});
</script>

<style lang="scss">
.ems-settings {
  height: 830px;
}
</style>
