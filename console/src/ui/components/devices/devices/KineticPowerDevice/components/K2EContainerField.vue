<template>
  <v-layer :config="fullContainerOptions">
    <v-group
      v-for="(row, rowIndex) in containersItemsList"
      :key="`row-${rowIndex}`"
      :config="defineContainersRowOptions(rowIndex)"
    >
      <v-rect
        v-for="(item, itemIndex) in row"
        :key="itemIndex"
        :config="defineContainerItemOptions(itemIndex)"
      />
    </v-group>
  </v-layer>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  props: {
    containerFieldOptions: Object as PropType<any>,
    containerCount: { default: 0, type: Number },
    itemsPerRow: { default: 16, type: Number },
    stepWidth: { default: null, type: Number },
    rowHeight: { default: 16, type: Number },
    rowGap: { default: 2, type: Number },
  },
  data() {
    return {
      localContainerFieldOptions: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    };
  },
  computed: {
    fullContainerOptions() {
      const y = this.containerFieldOptions?.y
        ? this.containerFieldOptions.y - this.currentNumberOfRows * this.rowHeight
        : 0;
      return { ...this.localContainerFieldOptions, ...this.containerFieldOptions, ...{ y } };
    },
    currentNumberOfRows() {
      return Math.ceil(this.containerCount / this.itemsPerRow);
    },
    localContainerItemOptions() {
      return {
        x: 0,
        y: 0,
        width: this.stepWidth - 2,
        height: this.rowHeight - 2,
        fill: this.$vuetify.theme.current.colors.accent,
      };
    },
    containersItemsList() {
      const result: any = [];
      const fullList: any = Array.from({ length: this.containerCount }, (v: any, k: any) => k);
      while (fullList.length) {
        result.push(fullList.splice(0, this.itemsPerRow));
      }
      return result.reverse();
    },
  },
  methods: {
    defineContainersRowOptions(order: number) {
      const local = {
        x: 0,
        y: this.rowHeight * order + this.rowGap / 2,
        width: this.containerFieldOptions?.width,
        height: this.rowHeight,
      };
      return { ...local };
    },
    defineContainerItemOptions(order: number) {
      const x = this.stepWidth * order + 1;
      return { ...this.localContainerItemOptions, ...{ x } };
    },
  },
});
</script>
