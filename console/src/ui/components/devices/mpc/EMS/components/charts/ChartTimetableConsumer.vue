<template>
  <div class="deviceBackground">
    <div class="d-flex justify-center pt-2">
      <div class="d-flex">
        <div v-for="(group, groupIndex) in systemSchema" :key="groupIndex">
          <!-- navigation of system instances -->
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
      <!-- current system instance chart view -->
      <MLModelLynusChartWrapper
        :key="reRenderKey"
        v-bind="{ ...currentChartData.data }"
        :is-preview="isPreview"
      />
    </div>
    <div v-else>
      {{ $t(`mlModel.EMS.charts.noDevicesConfigured`) }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import MLModelLynusChartWrapper from "@/ui/components/devices/mpc/components/MLModelLynusChartWrapper.vue";

/**
 * Component that represent chart Controlling Consumer.
 */
export default defineComponent({
  components: {
    MLModelLynusChartWrapper,
  },
  props: {
    systemsMappings: Object as PropType<any>,
    mpcId: [Object, String],
    scaling: {
      type: Object as PropType<any>,
      required: true,
    },
    isPreview: { default: false, type: Boolean },
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
      system: null, // example: battery
      instances: [], // example: ['battery1', 'battery2']
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
      currentChart,
      systemsUnits,
    };
  },
  computed: {
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
     * Creates an understandable object for the graphs component
     */
    currentChartData() {
      const chartOptions = this.currentChart.instances.map((instance: any) => {
        return this.systemsVars[this.currentChart.system].map((variable: any) => {
          // define name for batteries instances variables
          const getNameForBattery = () => {
            const title =
              this.systemsMappings[this.currentChart.system].components[instance].title || instance;
            const variableName = this.$t(`mlModel.EMS.charts.chartTimeTableConsumer.${variable}`);
            return `${variableName} ${title}`;
          };
          // define name for other systems instances variables
          const getName = () => {
            const { title } = this.systemsMappings[this.currentChart.system].components[instance];
            const variableName =
              this.systemsMappings[this.currentChart.system].components[instance][variable];
            return title || variableName;
          };
          const isBattery = this.currentChart.system === "battery";
          return {
            agg: "last",
            name: isBattery ? getNameForBattery() : getName(),
            scaling: this.systemsScaling[this.currentChart.system][variable],
            seriesType: "View",
            type: "line",
            unit: this.systemsUnits[this.currentChart.system][variable],
            var: this.systemsMappings[this.currentChart.system].components[instance][variable],
          };
        });
      });

      return {
        title: null,
        data: {
          chartTitle: "Chart title",
          chartHeight: 600,
          chartWrapperHeight: 750,
          chartData: {
            name: "",
            data: {
              chartOptions: chartOptions.flat(),
              selectedStackingOptions: "normal",
              selectedWidth: "full",
              type: "chart",
            },
          },
          navigationItemsToExclude: [],
        },
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
