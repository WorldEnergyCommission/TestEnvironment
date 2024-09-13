<template>
  <CoreCard>
    <CoreTabs :key="$i18n.locale" v-model="tab" class="tabs-with-space">
      <CoreTab v-for="(item, index) in chartsLibFiltered" :key="index">
        {{ $t(item.locale) }}
      </CoreTab>
    </CoreTabs>
    <CoreWindow v-model="tab">
      <CoreWindowItem v-for="(view, index) in chartsLibFiltered" :key="`t-${index}`">
        <CoreContainer fluid>
          <CoreRow>
            <CoreColumn
              v-for="(item, index) in view.data"
              :key="`c-${index}`"
              :lg="6"
              :md="12"
              :sm="12"
            >
              <component
                :is="item.type"
                :chart-description-type="item.chartDescriptionType"
                :chart-title="item.title"
                :chart-data="item.chartData"
                :column-view-type="item.columnViewType"
                :multiple-lines="item.multipleLines"
                style="min-height: 0; min-width: 0; height: 624px"
              />
            </CoreColumn>
          </CoreRow>
        </CoreContainer>
      </CoreWindowItem>
    </CoreWindow>
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";

import CircleSpinner from "@/ui/components/components/CenteredCircleSpinner.vue";
import { envDeviceLibraryCategories } from "@/utils/env";

const AreaChart = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/charts/AreaChart.vue"),
  loadingComponent: CircleSpinner,
});
const ColumnChart = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/charts/ColumnChart.vue"),
  loadingComponent: CircleSpinner,
});
const LineChart = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/charts/LineChart.vue"),
  loadingComponent: CircleSpinner,
});

export default defineComponent({
  components: {
    ColumnChart,
    LineChart,
    AreaChart,
  },
  data() {
    return {
      tab: null,
    };
  },
  computed: {
    chartsLib() {
      return [
        {
          name: "Line",
          locale: "uiComponents.devicesLibrary.chartTabs.line",
          data: [
            {
              type: "LineChart",
              title: "Type 1, Multiple Line",
              multipleLines: true,
              chartData: {
                data: {
                  chartOptions: [
                    {
                      agg: "diff",
                      name: "Series 1",
                      scaling: {
                        max: "35",
                        min: "10",
                      },
                      seriesType: "View",
                      type: "line",
                      unit: "",
                      var: "",
                    },
                    {
                      agg: "last",
                      name: "Series 2",
                      scaling: {
                        max: "30",
                        min: "10",
                      },
                      seriesType: "View",
                      type: "line",
                      unit: "",
                      var: "",
                    },
                  ],
                  selectedStackingOptions: "normal",
                  selectedWidth: "half",
                  type: "chart",
                },
                created_at: "2021-10-07T07:43:33.554983Z",
              },
            },
            {
              type: "LineChart",
              title: "Type 1, Single Line",
              multipleLines: false,
              chartData: {
                data: {
                  chartOptions: [
                    {
                      agg: "diff",
                      name: "Series 1",
                      scaling: {
                        max: "35",
                        min: "10",
                      },
                      seriesType: "View",
                      type: "line",
                      unit: "",
                      var: "",
                    },
                  ],
                  selectedStackingOptions: "normal",
                  selectedWidth: "half",
                  type: "chart",
                },
                created_at: "2021-10-07T07:43:33.554983Z",
              },
            },
            {
              type: "AreaChart",
              title: "Type 2, Multiple Area based line",
              multipleLines: true,
              chartData: {
                data: {
                  chartOptions: [
                    {
                      agg: "diff",
                      name: "Series 1",
                      scaling: {
                        max: "5",
                        min: "0",
                      },
                      seriesType: "View",
                      type: "area",
                      unit: "",
                      var: "",
                    },
                    {
                      agg: "last",
                      name: "Series 2",
                      scaling: {
                        max: "10",
                        min: "0",
                      },
                      seriesType: "View",
                      type: "area",
                      unit: "",
                      var: "",
                    },
                  ],
                  selectedStackingOptions: "normal",
                  selectedWidth: "half",
                  type: "chart",
                },
                created_at: "2021-10-07T07:43:33.554983Z",
              },
            },
            {
              type: "AreaChart",
              title: "Type 2, Single Area based line",
              multipleLines: false,
              chartData: {
                data: {
                  chartOptions: [
                    {
                      agg: "diff",
                      name: "Series 1",
                      scaling: {
                        max: "5",
                        min: "0",
                      },
                      seriesType: "View",
                      type: "area",
                      unit: "",
                      var: "",
                    },
                  ],
                  selectedStackingOptions: "normal",
                  selectedWidth: "half",
                  type: "chart",
                },
                created_at: "2021-10-07T07:43:33.554983Z",
              },
            },
          ],
        },
        {
          name: "Column",
          locale: "uiComponents.devicesLibrary.chartTabs.column",
          data: [
            {
              type: "ColumnChart",
              title: "Type 1, Multiple Columns, view 1",
              chartDescriptionType: "type1",
              columnViewType: null,
              multipleLines: true,
              chartData: {
                data: {
                  chartOptions: [
                    {
                      agg: "first",
                      name: "Series 1",
                      scaling: {
                        max: "25",
                        min: "0",
                      },
                      seriesType: "View",
                      type: "column",
                      unit: "",
                      var: "",
                    },
                    {
                      agg: "first",
                      name: "Series 2",
                      scaling: {
                        max: "20",
                        min: "0",
                      },
                      seriesType: "View",
                      type: "column",
                      unit: "",
                      var: "",
                    },
                  ],
                  selectedStackingOptions: undefined,
                  selectedWidth: "half",
                  type: "chart",
                },
                created_at: "2021-10-07T07:43:33.554983Z",
              },
            },
            {
              type: "ColumnChart",
              title: "Type 1, Multiple Columns, view 2",
              chartDescriptionType: "type1",
              columnViewType: "normal",
              multipleLines: true,
              chartData: {
                data: {
                  chartOptions: [
                    {
                      agg: "first",
                      name: "Series 1",
                      scaling: {
                        max: "20",
                        min: "0",
                      },
                      seriesType: "View",
                      type: "column",
                      unit: "",
                      var: "",
                    },
                    {
                      agg: "first",
                      name: "Series 2",
                      scaling: {
                        max: "30",
                        min: "0",
                      },
                      seriesType: "View",
                      type: "column",
                      unit: "",
                      var: "",
                    },
                  ],
                  selectedStackingOptions: "normal",
                  selectedWidth: "half",
                  type: "chart",
                },
                created_at: "2021-10-07T07:43:33.554983Z",
              },
            },
            {
              type: "ColumnChart",
              title: "Type 1, Single Column",
              chartDescriptionType: "type1",
              columnViewType: "normal",
              multipleLines: false,
              chartData: {
                data: {
                  chartOptions: [
                    {
                      agg: "first",
                      name: "Series 1",
                      scaling: {
                        max: "20",
                        min: "0",
                      },
                      seriesType: "View",
                      type: "column",
                      unit: "",
                      var: "",
                    },
                  ],
                  selectedStackingOptions: "normal",
                  selectedWidth: "half",
                  type: "chart",
                },
                created_at: "2021-10-07T07:43:33.554983Z",
              },
            },
            /*
                  {
                    type: 'ColumnChart',
                    title: 'Type 2, Multiple Columns, view 1',
                    chartDescriptionType: 'type2',
                    columnViewType: null,
                    multipleLines: true,
                  },
                  {
                    type: 'ColumnChart',
                    title: 'Type 2, Multiple Columns, view 2',
                    chartDescriptionType: 'type2',
                    columnViewType: 'normal',
                    multipleLines: true,
                  },
                  {
                    type: 'ColumnChart',
                    title: 'Type 2, Single Column',
                    chartDescriptionType: 'type2',
                    columnViewType: 'normal',
                    multipleLines: false,
                  },
                  */
          ],
        },
      ];
    },
    chartsLibFiltered() {
      return this.chartsLib.filter((e) => envDeviceLibraryCategories.Charts.includes(e.name));
    },
  },
});
</script>

<style lang="scss" scoped></style>
