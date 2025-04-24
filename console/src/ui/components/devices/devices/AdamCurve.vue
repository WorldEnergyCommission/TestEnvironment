<template>
  <div class="adam-curve">
    <DeviceCardWrapper>
      <template #title>
        <img src="/assets/eneries/adam.png" class="adam-energy-saving-logo" />
        <p class="adam-energy-saving-value">
          {{ $t("devices.AdamCurve.mainView.title") }} -{{ savingsPercentage }}%
        </p>
      </template>
      <template #actions>
        <DeviceActions :device="deviceData" @chart-change="onChange" />
      </template>
      <template #content>
        <BaseChart
          :chart-data="chartData"
          :threshold-value="deviceData?.data?.threshold"
          :min-number-of-series-for-wide-chart="4"
          :show-total-of-series="true"
          :show-time-selection="false"
          :show-device-actions="false"
          :post-processor="postprocessor"
          :show-header="false"
          :plugins="plugins"
        />

        <img src="/assets/eneries/save_energy.svg" class="adam-energy-saving-seal" />
      </template>
    </DeviceCardWrapper>
    <div class="device-dnd-button">
      <slot name="dnd" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import DeviceActions from "@/ui/components/devices/actions/DeviceActions.vue";
import BaseChart from "@/ui/components/devices/charts/charts/BaseChart.vue";
import DeviceCardWrapper from "@/ui/components/devices/layout/DeviceCardWrapper";

export default defineComponent({
  components: {
    BaseChart,
    DeviceCardWrapper,
    DeviceActions,
  },
  props: {
    deviceData: Object as PropType<IDevice>,
    isPreview: { default: false, type: Boolean },
  },
  data() {
    return {
      backgroundColors: ["transparent", "transparent"],
      borderColors: ["#CF0302", "#75B73D"],
      names: [
        this.$t("devices.AdamCurve.mainView.legend.regular"),
        this.$t("devices.AdamCurve.mainView.legend.savings"),
      ],
      value: 0,
    };
  },
  computed: {
    savingsPercentage() {
      return Math.abs(this.value || 0).toFixed(0);
    },
    plugins() {
      return [
        {
          id: "corsair",
          defaults: {
            width: 5,
            color: this.borderColors[1],
            dash: [10, 3],
          },
          afterInit: (chart, args, opts) => {
            chart.corsair = {
              x: 0,
              y: 0,
            };
          },
          afterEvent: (chart, args) => {
            const { inChartArea } = args;
            const { type, x, y } = args.event;

            chart.corsair = { x, y, draw: inChartArea };
            chart.draw();
          },
          beforeDatasetsDraw: (chart, args, opts) => {
            try {
              const { ctx } = chart;
              const { top, bottom, left, right } = chart.chartArea;
              const { x, y, draw } = chart.corsair;
              if (!draw) return;

              ctx.save();

              ctx.beginPath();
              ctx.lineWidth = opts.width;
              ctx.strokeStyle = opts.color;
              ctx.setLineDash(opts.dash);
              ctx.moveTo(x, bottom);
              ctx.lineTo(x, top);
              ctx.stroke();

              ctx.restore();
            } catch {}
          },
        },
        {
          id: "difference-tracker",
          afterDatasetsDraw: (chart) => {
            try {
              const values = chart.data.datasets.map(
                (ds) => ds.data.filter((point) => point.y != null).at(-1)?.y,
              );
              const difference = ((values[1] - values[0]) / values[0]) * 100;

              if (!isNaN(difference)) {
                this.value = difference;
              }
            } catch {}
          },
        },
      ];
    },
    chartOptions() {
      return Object.keys(this.deviceData.data.mappings)
        .map((key) => this.deviceData.data.mappings[key])
        .map((item, i) => {
          return {
            agg: "last",
            calculation: {
              aggregations: ["last"],
              expression: item,
            },
            miss: "locf",
            name: this.names[i],
            scaling: {
              max: null,
              min: null,
            },
            unit: this.deviceData.data?.meta.unit || "",
            borderWidth: 8,
            pointRadius: -1,
            backgroundColor: this.backgroundColors[i],
            borderColor: this.borderColors[i],
            seriesType: "Calculation",
            type: "area",
          };
        })
        .filter((i) => !!i);
    },
    chartData() {
      return {
        ...this.deviceData,
        data: {
          interval: "15m",
          periodName: "day",
          selectedStackingOptions: "",
          selectedWidth: "full",
          type: "chart",
          chartOptions: this.chartOptions,
          scaleXMax: new Date().toISOString(),
        },
      };
    },
  },
  methods: {
    postprocessor(data: any[][]) {
      return data;
    },
  },
});
</script>

<style lang="scss">
@import "./src/ui/scss/variables";

.adam-energy-saving-logo {
  width: 125px;
}

.adam-energy-saving-value {
  margin-top: 15px;
  margin-left: -100px;
  font-size: 28px;
  font-weight: 800;
  color: #75b73d;
}

.adam-energy-saving-seal {
  width: 125px;
  height: 125px;
  position: absolute;
  bottom: 60px;
  right: 15px;
  z-index: 1;
}

@media (max-width: 768px) {
  .adam-energy-saving-seal {
    width: 50px;
    bottom: 150px;
  }
}

@media (min-width: 768px) and (max-width: 1280px) {
  .adam-energy-savin-seal {
    width: 100px;
  }
}
</style>
