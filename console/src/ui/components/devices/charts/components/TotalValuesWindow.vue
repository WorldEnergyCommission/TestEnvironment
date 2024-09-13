<template>
  <FormModal :form-title="translatedTitle">
    <template #activator>
      <CoreButton :disabled="disabled" button-type="standardIcon">
        <CoreIcon>fas fa-table</CoreIcon>
      </CoreButton>
    </template>
    <template #content>
      <CoreTabs class="mb-2">
        <CoreTab v-if="props.seriesStats.length > 0" value="std">
          {{ $t("uiComponents.chartsTotalView.tabNames.standard") }}
        </CoreTab>
        <CoreTab v-if="props.differenceSeriesStats.length > 0" value="diff">
          {{ $t("uiComponents.chartsTotalView.tabNames.difference") }}
        </CoreTab>
      </CoreTabs>
      <CoreWindow v-model="tab">
        <!-- Tab 1 -->
        <CoreWindowItem
          v-if="props.seriesStats.length > 0"
          value="std"
          :reverse-transition="false"
          :transition="false"
        >
          <CoreCard>
            <CoreDataTable
              :headers="seriesStatsHeaders"
              :items="props.seriesStats"
              hide-default-footer
            >
              <!-- disable pagination -->
              <template #bottom />
              <!-- mobile version of total values window data table -->
              <template v-if="$vuetify.display.mobile" #headers />
              <template v-if="$vuetify.display.mobile" #body="{ items }">
                <tr
                  v-for="(item, index) in items"
                  :key="index"
                  class="v-data-table__mobile-table-row"
                >
                  <td class="v-data-table__mobile-row">
                    <div class="v-data-table__mobile-row__header">
                      {{ $t("uiComponents.chartsTotalView.tableHeaders.name") }}
                    </div>
                    <div class="v-data-table__mobile-row__cell">
                      {{ item.name }}
                    </div>
                  </td>
                  <td class="v-data-table__mobile-row">
                    <div class="v-data-table__mobile-row__header">
                      {{ $t("uiComponents.chartsTotalView.tableHeaders.min") }}
                    </div>
                    <div class="v-data-table__mobile-row__cell">
                      {{ item.minValue }}
                    </div>
                  </td>

                  <td class="v-data-table__mobile-row">
                    <div class="v-data-table__mobile-row__header">
                      {{ $t("uiComponents.chartsTotalView.tableHeaders.max") }}
                    </div>
                    <div class="v-data-table__mobile-row__cell">
                      {{ item.maxValue }}
                    </div>
                  </td>

                  <td class="v-data-table__mobile-row">
                    <div class="v-data-table__mobile-row__header">
                      {{ $t("uiComponents.chartsTotalView.tableHeaders.avg") }}
                    </div>
                    <div class="v-data-table__mobile-row__cell">
                      {{ item.avgValue }}
                    </div>
                  </td>

                  <td class="v-data-table__mobile-row">
                    <div class="v-data-table__mobile-row__header">
                      {{ $t("uiComponents.chartsTotalView.tableHeaders.unit") }}
                    </div>
                    <div class="v-data-table__mobile-row__cell">
                      {{ item.unit }}
                    </div>
                  </td>
                </tr>
              </template>
            </CoreDataTable>
          </CoreCard>
        </CoreWindowItem>
        <!-- Tab 2 -->
        <CoreWindowItem
          v-if="props.differenceSeriesStats.length > 0"
          value="diff"
          :reverse-transition="false"
          :transition="false"
        >
          <CoreDataTable
            :headers="differenceSeriesHeaders"
            :items="props.differenceSeriesStats"
            hide-default-footer
          >
            <!-- disable pagination -->
            <template #bottom />
            <template v-if="!$vuetify.display.mobile" #item.name="{ item }">
              <div style="max-width: 50%">
                {{ item.name }}
              </div>
            </template>

            <!-- mobile version of total values window data table -->
            <template v-if="$vuetify.display.mobile" #headers />
            <template v-if="$vuetify.display.mobile" #body="{ items }">
              <tr
                v-for="(item, index) in items"
                :key="index"
                class="v-data-table__mobile-table-row"
              >
                <td class="v-data-table__mobile-row">
                  <div class="v-data-table__mobile-row__header">
                    {{ $t("uiComponents.chartsTotalView.tableHeaders.name") }}
                  </div>
                  <div class="v-data-table__mobile-row__cell">
                    {{ item.name }}
                  </div>
                </td>

                <td class="v-data-table__mobile-row">
                  <div class="v-data-table__mobile-row__header">
                    {{ $t("uiComponents.chartsTotalView.tableHeaders.sum") }}
                  </div>
                  <div class="v-data-table__mobile-row__cell">
                    {{ item.sum }}
                  </div>
                </td>

                <td class="v-data-table__mobile-row">
                  <div class="v-data-table__mobile-row__header">
                    {{ $t("uiComponents.chartsTotalView.tableHeaders.unit") }}
                  </div>
                  <div class="v-data-table__mobile-row__cell">
                    {{ item.unit }}
                  </div>
                </td>
              </tr>
            </template>
          </CoreDataTable>
        </CoreWindowItem>
      </CoreWindow>
    </template>
  </FormModal>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import FormModal from "@/ui/components/modals/FormModal.vue";

// Properties
interface Props {
  differenceSeriesStats: { name: string; sum: string; unit: string }[];
  seriesStats: {
    name: string;
    minValue: string;
    maxValue: string;
    avgValue: string;
    unit: string;
  }[];
  currentSelectedPeriod: string;
  disabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

// Composables
const { t } = useI18n();

// Constants
const tab = ref("std");

// Computed
const seriesStatsHeaders = computed(() => [
  { title: t("uiComponents.chartsTotalView.tableHeaders.name"), value: "name" },
  { title: t("uiComponents.chartsTotalView.tableHeaders.min"), value: "minValue" },
  { title: t("uiComponents.chartsTotalView.tableHeaders.max"), value: "maxValue" },
  { title: t("uiComponents.chartsTotalView.tableHeaders.avg"), value: "avgValue" },
  { title: t("uiComponents.chartsTotalView.tableHeaders.unit"), value: "unit" },
]);

const differenceSeriesHeaders = computed(() => [
  { title: t("uiComponents.chartsTotalView.tableHeaders.name"), value: "name" },
  { title: t("uiComponents.chartsTotalView.tableHeaders.sum"), value: "sum" },
  { title: t("uiComponents.chartsTotalView.tableHeaders.unit"), value: "unit" },
]);

const translatedTitle = computed(() =>
  t(`uiComponents.chartsTotalView.titleMappings.${props.currentSelectedPeriod}`),
);
</script>

<style lang="scss">
@import "./src/ui/scss/variables";

.tabStyles {
  background: rgb(var(--v-theme-deviceBackground));
}

.dialog-view-design {
  background: transparent !important;

  .dialog-view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .dialog-view-title {
      font-size: 30px;
      color: rgb(var(--v-theme-accentLight));
      height: 40px;
      line-height: 1;
    }
  }

  .dialog-view-body {
    background: rgb(var(--v-theme-deviceBackground));
    border-radius: $border-radius-root !important;
    padding: 20px;
    height: 300px;
    overflow: scroll;
  }

  .v-text-field__slot {
    input {
      color: #525252 !important;
    }
  }
}

.v-list-item--highlighted.v-list-item.v-list-item--active {
  color: inherit !important;
}
</style>
