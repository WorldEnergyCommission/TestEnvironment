<template>
  <CoreRow>
    <CoreColumn cols="12" md="5">
      <LiveCard
        :grid="data.live.grid"
        :battery_soc="data.live.battery_soc"
        :pv="data.live.pv"
        :cs="data.live.cs"
        class="h-100"
      />
    </CoreColumn>
    <CoreColumn cols="12" md="7">
      <TodayCard
        :pv="data.today.pv"
        :trees_planted="data.today.trees_planted"
        :co2_saved="data.today.co2_saved"
        :coal_saved="data.today.coal_saved"
        :grid_consumption="data.today.grid_consumption"
        :grid_feed_in="data.today.grid_feed_in"
        :electricity_cost="data.today.electricity_cost"
        :electricity_earnings="data.today.electricity_earnings"
        :cs="data.today.cs"
        :cs_state_cycles="data.today.cs_state"
        :cs_earnings="data.today.cs_earnings"
      />
    </CoreColumn>
    <CoreColumn cols="12">
      <WeekCard
        :pv="data.week.pv"
        :grid_consumption="data.week.grid_consumption"
        :grid_feed_in="data.week.grid_feed_in"
        :autarchy="data.week.autarchy"
        :overall-autarchy="data.autarchy"
      />
    </CoreColumn>
  </CoreRow>
</template>

<script lang="ts" setup>
import { ReportModuleDataType } from ".";
import LiveCard from "@/ui/components/devices/modules/ReportModule/Cards/LiveCard.vue";
import TodayCard from "@/ui/components/devices/modules/ReportModule/Cards/TodayCard.vue";
import WeekCard from "@/ui/components/devices/modules/ReportModule/Cards/WeekCard.vue";

const props = defineProps<{
  data: ReportModuleDataType;
}>();
</script>
