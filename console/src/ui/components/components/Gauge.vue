<template>
  <div
    ref="elementWrapper"
    class="d-flex align-center justify-center h-100 child-overflow-visible"
    style="margin-left: -40px; margin-right: -40px; width: calc(100% + 70px)"
  />
</template>

<script lang="ts">
import { useElementSize } from "@vueuse/core";
import { gaugeChart, GaugeInterface, GaugeOptions } from "gauge-chart";
import { throttle } from "lodash";
import { defineComponent, PropType, ref } from "vue";

type OptionalGaugeInterface = GaugeInterface | undefined;
export default defineComponent({
  props: {
    options: Object as PropType<GaugeOptions>,
  },
  setup() {
    const elementWrapper = ref(null);
    const { width, height } = useElementSize(elementWrapper);
    return {
      elementWrapper,
      width,
      height,
    };
  },
  data() {
    const gaugeInstance = undefined as OptionalGaugeInterface;

    return {
      CHART_MAX_WIDTH: 600,
      gaugeInstance,
      elementWidth: 100,
      redrawThrottle: throttle(() => this.redraw(), 200),
    };
  },
  computed: {
    chartWidth() {
      return Math.min(this.elementWidth, this.CHART_MAX_WIDTH);
    },
  },
  watch: {
    options: [
      {
        handler: "updateListener",
      },
    ],
    width: [{ handler: "redrawAfterTick" }],
    height: [{ handler: "redrawAfterTick" }],
  },
  mounted() {
    this.redrawThrottle();
  },
  unmounted() {
    this.gaugeInstance?.removeGauge();
  },
  methods: {
    async redraw() {
      this.gaugeInstance?.removeGauge();

      // allow reflow to take original element full width to prevent scroll
      await this.$nextTick();

      // referenced elements need to be currently rendered
      if (!this.elementWrapper) {
        return;
      }
      const elWidth = (this.elementWrapper as HTMLDivElement).clientWidth;
      const elHeight = (this.elementWrapper as HTMLDivElement).clientHeight;

      this.elementWidth = Math.min(elWidth, elHeight * 2 - 80);

      // Initialize the library with the element reference
      this.gaugeInstance = gaugeChart(
        this.elementWrapper as HTMLDivElement,
        this.chartWidth,
        this.options ?? {},
      );
      this.gaugeInstance.updateNeedle(this.options?.needleValue ?? 0);
    },
    updateListener() {
      this.options?.needleValue && this.gaugeInstance?.updateNeedle(this.options.needleValue);
    },
    redrawAfterTick() {
      this.$nextTick(() => this.redrawThrottle());
    },
  },
});
</script>

<style lang="scss">
.child-overflow-visible svg {
  overflow: visible !important;
}
</style>
