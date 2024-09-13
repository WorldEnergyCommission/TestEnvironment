<template>
  <CoreButtonToggle v-model="active" group mandatory>
    <CoreButton
      v-for="(item, i) in items"
      :key="i"
      :disabled="disableNavButton"
      size="small"
      button-type="primary"
      @click="onItemChange(item.data)"
    >
      {{ $t(item.langPath) }}
    </CoreButton>
  </CoreButtonToggle>
</template>

<script lang="ts">
import { cloneDeep } from "lodash";
import { defineComponent, PropType } from "vue";

import { Periods } from "./ChartUtils";

/**
 * Component that represent periods navigation in charts
 */
export default defineComponent({
  props: {
    countLines: Number,
    countColumns: Number,
    disableNavButton: Boolean,
    period: { default: Periods.DAY, type: String },
    navigationItemsToExclude: Object as PropType<any>,
  },
  emits: ["selected"],
  data() {
    const items = [] as any[];
    const defaultItems: any[] = [
      { id: "live", langPath: "uiComponents.chartNavigation.LIVE", data: Periods.LIVE },
      { id: "hour", langPath: "uiComponents.chartNavigation.HOUR", data: Periods.HOUR },
      { id: "day", langPath: "uiComponents.chartNavigation.DAY", data: Periods.DAY },
      { id: "week", langPath: "uiComponents.chartNavigation.WEEK", data: Periods.WEEK },
      { id: "month", langPath: "uiComponents.chartNavigation.MONTH", data: Periods.MONTH },
      { id: "year", langPath: "uiComponents.chartNavigation.YEAR", data: Periods.YEAR },
    ];

    return {
      active: 2,
      defaultItems,
      items,
    };
  },
  computed: {
    isLineChart() {
      return this.countLines && this.countLines > 0 && this.countColumns === 0;
    },
    isColumnChart() {
      return this.countLines === 0 && this.countColumns! > 0;
    },
  },
  watch: {
    period: [
      {
        handler: "onPeriodChange",
      },
    ],
    countColumns: [
      {
        handler: "updateVisibleButtons",
      },
    ],
  },
  created(): void {
    this.items = cloneDeep(this.defaultItems);

    // exclude disabled periods
    this.excludeNotWantedItems();

    // update the active tab at startup
    this.onPeriodChange();
  },
  mounted(): void {
    setTimeout(() => {
      this.onItemChange(this.items[this.active].data);
    }, 100);
  },
  methods: {
    onItemChange(x: string) {
      this.$emit("selected", x);
    },
    /**
     * Excludes periods from navigation
     */
    excludeNotWantedItems() {
      if (this.navigationItemsToExclude) {
        this.navigationItemsToExclude.forEach((btn: any) => {
          this.items = this.items.filter((el: any) => el.id !== btn);
        });
      }
    },
    onPeriodChange() {
      this.active = this.items.map((e) => e.id).indexOf(this.period);
    },
    updateVisibleButtons() {
      if (this.items.length === 4 && this.isLineChart) {
        this.items = cloneDeep(this.defaultItems);
        this.active = 0;

        this.excludeNotWantedItems();
      }
      if (this.items.length === 5 && this.isColumnChart) {
        this.active = 0;

        this.excludeNotWantedItems();
      }
    },
  },
});
</script>
