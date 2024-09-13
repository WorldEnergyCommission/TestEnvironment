<template>
  <div class="forecast">
    <CoreTabs v-model="tab" fixed-tabs>
      <CoreTab v-for="(item, index) in tabs" :key="index">
        {{ $rt(($tm(item.locale) as any)[index]) }}
      </CoreTab>
    </CoreTabs>

    <CoreWindow v-model="tab">
      <CoreWindowItem v-for="(item, index) in tabs" :key="index">
        <component
          :is="item.component"
          :key="rerenderKey"
          :chart-title="item.title"
          :chart-type="item.chartType"
          :chart-width="item.chartWidth"
          :series="item.series"
          :y-axis="item.yAxis"
          :is-preview="isPreview"
        />
      </CoreWindowItem>
    </CoreWindow>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BaseChart from "@/ui/components/devices/mpc/components/BaseChart.vue";

/**
 * Component that represent forecast chart.
 */
export default defineComponent({
  components: {
    BaseChart,
  },
  props: {
    deviceId: String,
    isPreview: { default: false, type: Boolean },
  },
  data() {
    const tab: any = null;
    const mpc: any = null;
    const timer: any = null;

    return {
      timer,
      rerenderKey: 0,
      mpc,
      tab,
      fullscreen: false,
      yAxisTempValve: [
        {
          title: null,
          opposite: false,
          showFirstLabel: true,
          showLastLabel: true,
          endOnTick: false,
          gridLineWidth: 1,
          min: 0,
          max: 40,
          lineColor: "#6ca2d8",
          labels: {
            format: "{value} °C",
            style: {
              color: "#6ca2d8",
            },
          },
        },
        {
          title: null,
          opposite: false,
          showFirstLabel: true,
          showLastLabel: true,
          endOnTick: false,
          gridLineWidth: 0,
          min: 0,
          max: 100,
          lineColor: "#90ed7d",
          labels: {
            format: "{value} %",
            style: {
              color: "#90ed7d",
            },
          },
        },
      ],
      yAxisWeather: [
        {
          title: null,
          opposite: false,
          showFirstLabel: true,
          showLastLabel: true,
          endOnTick: false,
          gridLineWidth: 1,
          min: -20,
          max: 50,
          lineColor: "#ab5050",
          labels: {
            format: "{value} °C",
            style: {
              color: "#ab5050",
            },
          },
        },
        {
          title: null,
          opposite: false,
          showFirstLabel: true,
          showLastLabel: true,
          endOnTick: false,
          gridLineWidth: 0,
          min: 0,
          max: 1500,
          lineColor: "#ab8a50",
          labels: {
            format: "{value} W/m2",
            style: {
              color: "#ab8a50",
            },
          },
        },
      ],
    };
  },
  computed: {
    /**
     * Prepares series for chart
     */
    seriesTempValve() {
      return [
        {
          name: this.$t(
            "mlModel.HeatingCircuitOptimization.settingsView.chartLabels.tempValve.roomTemp",
          ),
          type: "line",
          yAxis: 0,
          color: "#6ca2d8",
          data: this.roomTemperatureForecast,
        },
        {
          name: this.$t(
            "mlModel.HeatingCircuitOptimization.settingsView.chartLabels.tempValve.valvePosition",
          ),
          type: "line",
          yAxis: 1,
          color: "#90ed7d",
          data: this.optimizedControl,
        },
      ];
    },
    /**
     * Prepares series for chart
     */
    seriesWeather() {
      return [
        {
          name: this.$t("mlModel.HeatingCircuitOptimization.settingsView.chartLabels.weather.air"),
          type: "line",
          yAxis: 0,
          color: "#ab5050",
          data: this.modifyWeatherForecastTime.air_temperature_forecast,
        },
        {
          name: this.$t(
            "mlModel.HeatingCircuitOptimization.settingsView.chartLabels.weather.globalRadiation",
          ),
          type: "line",
          yAxis: 1,
          color: "#ab8a50",
          data: this.modifyWeatherForecastTime.global_radiation_horizontal,
        },
      ];
    },
    langPath() {
      return "mlModel.HeatingCircuitOptimization.settingsView.forecastTabs";
    },
    charts() {
      if (this.mpc) {
        return this.mpc?.data?.meta.charts;
      }
      return null;
    },
    /**
     * Converts time to milliseconds for every item of weather_forecast array
     */
    modifyWeatherForecastTime() {
      if (this.charts) {
        const res = Object.entries(this.charts.weather_forecast).map((item: any) => {
          return [item[0], item[1].map((i: any) => [i[0] * 1000, i[1]])];
        });
        let obj: any = {};
        res.forEach((item: any) => (obj = { ...obj, ...{ [item[0]]: item[1] } }));
        return obj;
      } else {
        return {
          air_temperature_forecast: [],
          diffuse_radiation_horizontal: [],
          direct_normal_radiation: [],
          global_radiation_horizontal: [],
          global_radiation_inclined: [],
        };
      }
    },
    /**
     * Converts time to milliseconds for every item of optimized_control array
     */
    optimizedControl() {
      if (this.charts) {
        return this.charts.optimized_control.map((item: any) => [item[0] * 1000, item[1]]);
      } else {
        return [];
      }
    },
    /**
     * Converts time to milliseconds for every item of room_temperature_forecast array
     */
    roomTemperatureForecast() {
      if (this.charts) {
        return this.charts.room_temperature_forecast.map((item: any) => [item[0] * 1000, item[1]]);
      } else {
        return [];
      }
    },
    settingsViewLang() {
      return "mlModel.HeatingCircuitOptimization.settingsView.chartTabs";
    },
    tabs() {
      return [
        {
          title: "Temp/Valve",
          locale: this.langPath,
          component: "BaseChart",
          chartType: "line",
          chartWidth: null,
          series: this.seriesTempValve,
          yAxis: this.yAxisTempValve,
        },
        {
          title: "Weather",
          locale: this.langPath,
          component: "BaseChart",
          chartType: "line",
          chartWidth: null,
          series: this.seriesWeather,
          yAxis: this.yAxisWeather,
        },
      ];
    },
  },
  async mounted() {
    if (!this.isPreview) {
      this.mpc = await this.fetchMPCData(this.deviceId);
      this.fetchChartData();
    } else {
      this.mpc = {
        data: {
          meta: {
            charts: {
              weather_forecast: {
                air_temperature_forecast: [
                  [1583100000000, 20],
                  [1583114400000, 25],
                  [1583128800000, 22],
                  [1583143200000, 22],
                  [1583157600000, 22],
                  [1583172000000, 27],
                  [1583186400000, 30],
                ],
                global_radiation_horizontal: [
                  [1583100000000, 20],
                  [1583114400000, 25],
                  [1583128800000, 22],
                  [1583143200000, 22],
                  [1583157600000, 22],
                  [1583172000000, 27],
                  [1583186400000, 30],
                ],
              },
              room_temperature_forecast: [
                [1583100000000, 22],
                [1583103600000, 25],
                [1583107200000, 22],
                [1583110800000, 23],
                [1583114400000, 24],
                [1583118000000, 28],
                [1583121600000, 29],
              ],
              optimized_control: [
                [1583100000000, 23],
                [1583103600000, 26],
                [1583107200000, 22],
                [1583110800000, 28],
                [1583114400000, 28],
                [1583118000000, 29],
                [1583121600000, 29],
              ],
            },
          },
        },
      };
    }
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    /**
     * Updates chart data every 90 seconds
     */
    fetchChartData() {
      this.timer = setInterval(async () => {
        this.mpc = await this.fetchMPCData(this.deviceId);
        this.rerenderKey += 1;
      }, 900000);
    },
    fetchMPCData(payload: any): any {
      return this.$store.dispatch("mpc/fetchMPCData", payload);
    },
  },
});
</script>

<style lang="scss">
.heating-circuit-optimization-charts {
  .forecast {
    min-height: 560px;
  }
}
</style>
