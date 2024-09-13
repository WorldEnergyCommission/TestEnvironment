<template>
  <div class="deviceBackground">
    <div class="d-flex justify-center pt-2">
      <div class="d-flex">
        <div v-for="(group, groupIndex) in systemSchema" :key="groupIndex">
          <CoreMenu>
            <template #activator="{ props }">
              <CoreButton button-type="terciary" size="small" v-bind="props">
                {{ $t(`mlModel.EMS.systems.${group[0]}.title`) }}
              </CoreButton>
            </template>
            <CoreList v-if="group[1].length" density="compact">
              <CoreListItem
                v-for="(arrayOfSystemInstanceNames, arrayOfSystemInstanceNamesIndex) in group[1]"
                :key="arrayOfSystemInstanceNamesIndex"
                link
                @click="handleCurrentChart(group[0], arrayOfSystemInstanceNames)"
              >
                <CoreListItemTitle>
                  {{ $t(`mlModel.EMS.systems.${group[0]}.title`) }}
                  {{ defineMenuItemName(arrayOfSystemInstanceNames) }}
                </CoreListItemTitle>
              </CoreListItem>
            </CoreList>
          </CoreMenu>
        </div>
      </div>
    </div>

    <div v-if="currentChart.system" class="content pt-2">
      <BaseChart :key="reRenderKey" v-bind="{ ...currentChartData }" />
    </div>
    <div v-else>
      {{ $t(`mlModel.EMS.charts.noDevicesConfigured`) }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import ChartColors from "@/ui/components/devices/charts/charts/ChartColors";
import BaseChart from "@/ui/components/devices/mpc/components/BaseChart.vue";

/**
 * Component that represent forecast chart Controlling Consumer.
 */
export default defineComponent({
  components: {
    BaseChart,
  },
  props: {
    systemsMappings: Object as PropType<any>,
    predictedTargetPower: Object as PropType<any>,
    predictedSOC: Object as PropType<any>,
    predictedPower: Object as PropType<any>,
    mpcId: [Object, String],
    scaling: {
      type: Object as PropType<any>,
      required: true,
    },
  },
  data() {
    const systemsUnits: any = {
      battery: {
        target_power: "%",
        soc: "%",
        power: "kW",
      },
      charge_station: {
        target_power: "%",
      },
      electric_heating: {
        target_power: "%",
      },
      heating_pump: {
        target_power: "%",
      },
      big_consumer: {
        target_power: "%",
      },
    };
    const currentChart: any = {
      system: null,
      instances: [],
    };
    const variablesContainers: any = {
      target_power: "predictedTargetPower",
      soc: "predictedSOC",
      power: "predictedPower",
    };
    const systemsVars: any = {
      battery: ["target_power", "soc", "power"],
      charge_station: ["target_power"],
      electric_heating: ["target_power"],
      heating_pump: ["target_power"],
      big_consumer: ["target_power"],
    };
    const systems: any = [
      "battery",
      "charge_station",
      "electric_heating",
      "heating_pump",
      "big_consumer",
    ];

    return {
      reRenderKey: 0,
      systems,
      systemsVars,
      variablesContainers,
      currentChart,
      systemsUnits,
    };
  },
  computed: {
    chartColors() {
      return ChartColors.colors(this.$vuetify.theme.current.dark);
    },
    /**
     * Collection of systems scaling
     */
    systemsScaling(): any {
      return {
        battery: {
          target_power: { min: -100, max: 100 },
          soc: { min: 0, max: 100 },
          power: {
            min: this.scaling?.batteryPower ? 0 - this.scaling?.batteryPower * 2 : null,
            max: this.scaling?.batteryPower ? this.scaling?.batteryPower * 2 : null,
          },
        },
        charge_station: {
          target_power: { min: 0, max: 100 },
        },
        electric_heating: {
          target_power: { min: 0, max: 100 },
        },
        heating_pump: {
          target_power: { min: 0, max: 100 },
        },
        big_consumer: {
          target_power: { min: 0, max: 100 },
        },
      };
    },
    /**
     * Creates array of systems groups and system instances.
     * @return {array} list of system groups. Example: ['battery', [['battery1', 'battery2']]]
     */
    systemSchema() {
      const filteredSystems = Object.entries(this.systemsMappings).filter((system: any) =>
        this.systems.some((el: any) => el === system[0] && system[1].count),
      );
      return filteredSystems.map((el: any) => {
        if (el[0] === "battery") return this.defineInstancesGroups(el, 3);
        else return this.defineInstancesGroups(el, 9);
      });
    },
    /**
     * Creates series, Y-axis for chart
     */
    currentChartData() {
      const series: any = this.currentChart.instances.map((instance: any, inx: number) => {
        return this.systemsVars[this.currentChart.system].map((variable: any) => {
          const data: any = (this as any)[this.variablesContainers[variable]][instance].map(
            (d: any) => [d[0] * 1000, d[1]],
          );

          const systemInstanceName: string =
            this.systemsMappings[this.currentChart.system].components[instance].title;
          const systemInstanceVariableName: string =
            this.systemsMappings[this.currentChart.system].components[instance][variable];
          const getNameForBattery = () => {
            const variableName = this.$t(`mlModel.EMS.charts.chartTimeTableConsumer.${variable}`);
            return `${variableName} ${systemInstanceName || instance}`;
          };
          const getName = () => {
            return systemInstanceName || systemInstanceVariableName;
          };
          const isBattery = this.currentChart.system === "battery";
          return {
            name: isBattery ? getNameForBattery() : getName(),
            type: "line",
            yAxis: null, // will add later
            color: null, // will add later
            data,
          };
        });
      });
      const seriesColors = series.flat().map((serie: any, inx: number) => {
        serie.color = this.chartColors[inx];
        serie.yAxis = inx;
        return serie;
      });

      const yAxis: any = this.currentChart.instances.map((instance: any, inx: number) => {
        return this.systemsVars[this.currentChart.system].map((variable: any) => {
          return {
            title: null,
            opposite: false,
            showFirstLabel: true,
            showLastLabel: true,
            endOnTick: false,
            gridLineWidth: 0,
            ...this.systemsScaling[this.currentChart.system][variable],
            lineColor: null, // will added later
            labels: {
              format: `{value} ${this.systemsUnits[this.currentChart.system][variable]}`,
              style: {
                color: null, // will added later
              },
            },
          };
        });
      });
      const yAxisColors = yAxis.flat().map((axis: any, inx: number) => {
        axis.lineColor = this.chartColors[inx];
        axis.labels.style.color = this.chartColors[inx];
        axis.gridLineWidth = !inx ? 1 : 0;
        return axis;
      });
      return {
        chartType: "line",
        chartWidth: null,
        chartHeight: 600,
        series: seriesColors,
        yAxis: yAxisColors,
      };
    },
  },
  mounted() {
    this.initFirstSystemByDefault();
  },
  methods: {
    /**
     * Division of group systems into subgroups depending on the value of the separator.
     * @param {array} system list of systems
     * @param {number} splitter Separator determining the number of elements in a subgroup
     */
    defineInstancesGroups(system: [string, { components: any; count: number }], splitter: number) {
      const instancesArr: any = Object.keys(system[1].components);
      const count: any = Math.ceil(system[1].count / splitter);
      let instancesArrGrouped: any = [];
      const initChartList = (n: number, arr: any) => {
        if (n > 0) {
          initChartList(n - 1, arr);
          instancesArrGrouped = [
            ...instancesArrGrouped,
            arr.slice(n * splitter - splitter, n * splitter),
          ];
        } else {
          return null;
        }
      };
      initChartList(count, instancesArr);

      return [system[0], instancesArrGrouped];
    },
    /**
     * Creates a name for the menu item from an array of instances.
     * @param {array} arr list on system instances names
     * @return {string} menu item name. Example: 1-9
     */
    defineMenuItemName(arr: any) {
      const filterFromNotNumber = (str: string) => +str.replace(/\D+/g, "");
      if (!arr.length) return null;
      if (arr.length === 1) return filterFromNotNumber(arr[0]);
      else {
        const first: any = arr[0];
        const last: any = arr[arr.length - 1];
        return `${filterFromNotNumber(first)}-${filterFromNotNumber(last)}`;
      }
    },
    handleCurrentChart(system: any, arr: any) {
      this.currentChart = { system, instances: arr };
      this.reRenderKey += 1;
    },
    /**
     * Init what system chart will load when open page.
     */
    initFirstSystemByDefault() {
      const filtered: any = this.systemSchema.filter((el: any) => el[1].length);
      this.currentChart = filtered.length
        ? {
            system: filtered[0][0],
            instances: filtered[0][1][0],
          }
        : {
            system: null,
            instances: [],
          };
    },
  },
});
</script>

<style lang="scss" scoped></style>
