<template>
  <FormModal :form-title="props.name">
    <template #activator="{ props: activatorProps }">
      <CoreButton button-type="standardIcon" v-bind="activatorProps">
        <CoreIcon>fas fa-table</CoreIcon>
      </CoreButton>
    </template>
    <template #content>
      <div style="overflow: auto">
        <CoreCard class="mb-3 pa-3">
          <div class="d-flex justify-space-between">
            <div>{{ t("devices.WeekTrendSummary.mainView.changesDescription") }}:</div>
            <div>
              <b> {{ props.formattedTrend }} % </b>
            </div>
          </div>
          <div v-if="props.showTrendNote" class="text-subtitle-2">
            <b>{{ t("devices.WeekTrendSummary.mainView.note") }}:</b>
            {{ t("devices.WeekTrendSummary.mainView.noteDescription") }}
          </div>
          <div class="d-flex justify-space-between">
            <div>{{ t("devices.WeekTrendSummary.mainView.avgDescription") }}:</div>
            <div>
              <b> {{ props.formattedAverage }} kWh </b>
            </div>
          </div>
        </CoreCard>
        <CoreCard class="w-100 h-100">
          <CoreDataTable :headers="tableHeaders" :items="props.items">
            <!-- disable pagination -->
            <template #bottom />

            <!-- mobile version of permissions data table -->
            <template v-if="$vuetify.display.mobile" #headers />
            <template v-if="$vuetify.display.mobile" #body="{ items }">
              <tr
                v-for="(item, index) in items"
                :key="index"
                class="v-data-table__mobile-table-row"
              >
                <td class="v-data-table__mobile-row">
                  <div class="v-data-table__mobile-row__header">
                    {{ t("devices.WeekTrendSummary.mainView.day") }}
                  </div>
                  <div class="v-data-table__mobile-row__cell">
                    {{ item.name }}
                  </div>
                </td>
                <td class="v-data-table__mobile-row">
                  <div class="v-data-table__mobile-row__header">
                    {{ t("devices.WeekTrendSummary.mainView.lastWeek") }}
                  </div>
                  <div class="v-data-table__mobile-row__cell">
                    {{ item.previousWeek }}
                  </div>
                </td>

                <td class="v-data-table__mobile-row">
                  <div class="v-data-table__mobile-row__header">
                    {{ t("devices.WeekTrendSummary.mainView.thisWeek") }}
                  </div>
                  <div class="v-data-table__mobile-row__cell">
                    {{ item.selectedWeek }}
                  </div>
                </td>

                <td class="v-data-table__mobile-row">
                  <div class="v-data-table__mobile-row__header">
                    {{ t("devices.WeekTrendSummary.mainView.trend") }}
                  </div>
                  <div class="v-data-table__mobile-row__cell">
                    <span v-if="item.trend === '-'">
                      {{ item.trend }}
                    </span>
                    <CoreIcon v-else :color="item.trend > 0 ? 'red' : 'green'">
                      {{ item.trend > 0 ? "fas fa-arrow-up" : "fas  fa-arrow-down" }}
                    </CoreIcon>
                  </div>
                </td>

                <td class="v-data-table__mobile-row">
                  <div class="v-data-table__mobile-row__header">
                    {{ t("devices.WeekTrendSummary.mainView.diff") }}
                  </div>
                  <div class="v-data-table__mobile-row__cell">
                    {{ item.diff }}
                  </div>
                </td>

                <td class="v-data-table__mobile-row">
                  <div class="v-data-table__mobile-row__header">
                    {{ t("devices.WeekTrendSummary.mainView.dailyAvg") }}
                  </div>
                  <div class="v-data-table__mobile-row__cell">
                    {{ item.dailyAverage }}
                  </div>
                </td>
              </tr>
            </template>

            <template #item.trend="{ item }">
              <span v-if="item.trend === '-'">
                {{ item.trend }}
              </span>
              <CoreIcon v-else :color="item.trend > 0 ? 'red' : 'green'">
                {{ item.trend > 0 ? "fas fa-arrow-up" : "fas  fa-arrow-down" }}
              </CoreIcon>
            </template>
          </CoreDataTable>
        </CoreCard>
      </div>
    </template>
  </FormModal>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import FormModal from "@/ui/components/modals/FormModal.vue";

const props = defineProps<{
  name: string;
  formattedTrend: string;
  showTrendNote: boolean;
  formattedAverage: string;
  items: {
    name: string;
    previousWeek: string;
    selectedWeek: string;
    trend: string | number;
    diff: string;
    dailyAverage: string;
  }[];
}>();

const { t } = useI18n();

const tableHeaders = computed(() => {
  return [
    {
      title: t("devices.WeekTrendSummary.mainView.day"),
      value: "name",
    },
    {
      title: t("devices.WeekTrendSummary.mainView.lastWeek"),
      value: "previousWeek",
    },
    {
      title: t("devices.WeekTrendSummary.mainView.thisWeek"),
      value: "selectedWeek",
    },
    {
      title: t("devices.WeekTrendSummary.mainView.trend"),
      value: "trend",
      sortable: false,
    },
    {
      title: t("devices.WeekTrendSummary.mainView.diff"),
      value: "diff",
    },
    {
      title: t("devices.WeekTrendSummary.mainView.dailyAvg"),
      value: "dailyAverage",
    },
  ];
});
</script>
