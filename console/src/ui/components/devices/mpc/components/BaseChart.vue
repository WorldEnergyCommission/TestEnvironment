<template>
  <div class="simple-chart">
    <div class="chart-instance-actions">
      <DataExport :data-to-export="series" />
      <CoreTooltip location="bottom">
        <template #activator="{ props }">
          <CoreButton button-type="standardIcon" v-bind="props" @click="handleFullScreen">
            <CoreIcon>fas fa-expand</CoreIcon>
          </CoreButton>
        </template>
        <span>Full screen</span>
      </CoreTooltip>
    </div>

    <div style="overflow-x: auto">
      <div :style="`width: ${chartWidth}px`">
        <Chart
          ref="hc"
          :constructor-type="'chart'"
          :options="chartOptions"
          :style="`height: ${chartHeight}px`"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * Component that represent chart.
 * Used in MPC devices.
 */
import * as Highcharts from "highcharts";
import Highstock from "highcharts/highstock";
import fullscreen from "highcharts/modules/full-screen";
import stockInit from "highcharts/modules/stock";
import { Chart } from "highcharts-vue";
import { computed, PropType, ref } from "vue";
import { useTheme } from "vuetify";

import { periodConfigurations } from "../../charts/charts/ChartUtils";
import DataExport from "@/ui/components/devices/charts/components/DataExport.vue";

stockInit(Highcharts);
fullscreen(Highcharts);

/**
 * Returns the date string for the passed unix timestamp
 * @param format the date format string
 * @param timestamp the unix timestamp
 * @return the formatted date string
 */
function formatUnixTimestamp(format: string, timestamp: any) {
  const date = new Date(timestamp);
  const utcDate = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  );
  return Highstock.dateFormat(format, utcDate);
}

type Series = {
  name: string;
  type: string;
  yAxis: number;
  color: string | null;
  data: [number, number][];
  unit: string;
};

type AxisLabel = {
  title: string | null;
  opposite: boolean;
  showFirstLabel: boolean;
  showLastLabel: boolean;
  endOnTick: boolean;
  gridLineWidth: number;
  min: number;
  max: number;
  lineColor: string | null;
  labels: {
    format: string;
    style: {
      color: string | null;
    };
  };
};

const props = defineProps({
  chartType: {
    type: String,
    default: "line",
  },
  chartTitle: {
    type: String,
    default: "Chart",
  },
  series: {
    type: Array as PropType<Series[]>,
    default: () => [],
  },
  yAxis: {
    type: Array as PropType<AxisLabel[]>,
    default: () => [],
  },
  chartWidth: { default: 400, type: Number },
  chartHeight: { default: 400, type: Number },
});

const { current: theme } = useTheme();

const chartOptions = computed(() => {
  return {
    chart: {
      backgroundColor: theme.value.colors.deviceBackground,
      animation: false,
      width: null,
      height: null,
      events: {
        redraw: (e: any) => {
          handleFullScreenChartName(e);
        },
      },
    },
    tooltip: {
      shared: true,
      // xDateFormat now working...
      xDateFormat: "%Y-%m-%d",
      useHTML: true,
      formatter: function () {
        const currentPointIndex = (this as any).points[0].point.index;
        const seriesData = (this as any).points[0].series.data;
        const nextTimestamp = seriesData[currentPointIndex + 1]?.x;
        const currentFormattedTimestamp = formatUnixTimestamp(
          periodConfigurations.day.tooltipFormat,
          (this as any).x,
        );
        const nextFormattedTimestamp = formatUnixTimestamp(
          periodConfigurations.day.tooltipFormat,
          nextTimestamp - 1,
        );
        const formattedPeriodInterval =
          currentFormattedTimestamp +
          (nextTimestamp ? `&nbsp;-&nbsp;${nextFormattedTimestamp}` : "");
        const headerFormat = `<table><tr style="font-size: 10px; color: rgb(51, 51, 51);"><td colspan="3">${formattedPeriodInterval}</td></tr>`;
        const pointFormats = (this as any).points.map((element: any) => {
          return (
            `<tr><td><span style="color: ${element.series.color};">&nbsp;●&nbsp;</span>&nbsp;${element.series.name}&nbsp;</td>` +
            `<td style="text-align: right;"><b>&nbsp;${element.y.toFixed(2)}&nbsp;</b></td>` +
            `<td style="text-align: left;"><b>&nbsp;${element.series.userOptions.unit}&nbsp;</b></td></tr>`
          );
        });
        const footerFormat = "</table>";
        return headerFormat + pointFormats.join("") + footerFormat;
      },
    },
    exporting: {
      enabled: false,
    },
    rangeSelector: {
      enabled: false,
    },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    series: props.series,
    legend: {
      enabled: true,
      itemStyle: {
        color: theme.value.dark ? "#ffffff" : "#000000",
      },
    },
    xAxis: {
      type: "datetime",
      labels: {
        formatter: (e: any) => {
          return formatUnixTimestamp(periodConfigurations.day.format, +e.value);
        },
        style: {
          color: theme.value.dark ? "#ffffff" : "#000000",
        },
      },
      tickInterval: periodConfigurations.day.tickInterval,
      lineColor: theme.value.dark ? "#ffffff" : "#000000",
      tickColor: theme.value.dark ? "#ffffff" : "#000000",
    },
    yAxis: props.yAxis,
    title: "",
  };
});

const hc = ref(null);
function handleFullScreen() {
  const { chart } = hc.value as any;
  chart.fullscreen.open();
}

function handleFullScreenChartName(e: any) {
  const { chart } = hc.value as any;
  if (!chart?.fullscreen?.isOpen) {
    chart.setTitle({ text: null });
  } else {
    chart.setTitle({ text: props.chartTitle });
  }
}
</script>

<style lang="scss" scoped>
.simple-chart {
  background: rgb(var(--v-theme-deviceBackground));

  .chart-instance-actions {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
