<template>
  <v-group :config="drivesGroupOptions">
    <K2EDrive
      v-for="(item, index) in drivesKeysList"
      :key="index"
      :drive-data="drives[item]"
      :drive-position-x="defineDrivePositionX(index)"
      :max-height="drivesGroupOptions.height"
      :row-height="rowHeight"
      :step-width="stepWidth"
    />
  </v-group>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import K2EDrive from "@/ui/components/devices/devices/KineticPowerDevice/components/K2EDrives/K2EDrive.vue";

export default defineComponent({
  components: { K2EDrive },
  props: {
    drives: Object as PropType<any>,
    drivesGroupOptions: Object as PropType<any>,
    stepWidth: Object as PropType<any>,
    rowHeight: Object as PropType<any>,
  },
  computed: {
    drivesKeysList() {
      return Object.keys(this.drives);
    },
  },
  methods: {
    defineDrivePositionX(order: number) {
      const numberOfDrives = this.drivesKeysList.length;
      if (numberOfDrives) {
        const { width } = this.drivesGroupOptions;
        const driveArea = width / numberOfDrives;
        return driveArea * order + driveArea / 2;
      } else {
        return 0;
      }
    },
  },
});
</script>

<style lang="scss" scoped></style>
