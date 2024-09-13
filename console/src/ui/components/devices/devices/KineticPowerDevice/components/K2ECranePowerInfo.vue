<template>
  <div class="basicStyles d-flex flex-column justify-center">
    <div class="additionalStyles">
      {{ actualPower }}
    </div>
    <div class="additionalStyles">
      {{ sumSocPositive }}
    </div>
    <div class="additionalStyles">
      {{ sumSocNegative }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { RootState } from "@/store/types";

export default defineComponent({
  props: {
    deviceData: { type: Object as PropType<any>, required: true },
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    measurements() {
      return this.measurementsState.measurements;
    },
    actualPower() {
      let val: any = this.measurements.get(this.deviceData.actualPower);
      if (val !== undefined) {
        val = parseInt(val, 10).toFixed(2);
      }
      return this.$t("devices.KineticPower.mainView.craneActualPower", { msg: val });
    },
    sumSocPositive() {
      const arrayPositiveSoc: any[] = [];
      Object.values(this.deviceData.cranes).forEach((craneObj: any, index: number) => {
        let val: any = this.measurements.get(craneObj.socPositive);
        val = parseInt(val, 10);
        arrayPositiveSoc.push(val);
      });
      let sumSocPositive = 0;
      for (let i = 0; i < arrayPositiveSoc.length; i++) {
        sumSocPositive += arrayPositiveSoc[i];
      }
      return this.$t("devices.KineticPower.mainView.craneSocPositive", {
        msg: sumSocPositive.toFixed(2),
      });
    },
    sumSocNegative() {
      const arrayNegSoc: any[] = [];
      Object.values(this.deviceData.cranes).forEach((craneObj: any, index: number) => {
        let val: any = this.measurements.get(craneObj.socNegative);
        val = parseInt(val, 10);
        arrayNegSoc.push(val);
      });
      let sumSocNegative = 0;
      for (let i = 0; i < arrayNegSoc.length; i++) {
        sumSocNegative += arrayNegSoc[i];
      }
      return this.$t("devices.KineticPower.mainView.craneSocNegative", {
        msg: sumSocNegative.toFixed(2),
      });
    },
  },
});
</script>

<style>
.basicStyles {
  height: 100px;
  width: 100%;
}

.additionalStyles {
  display: flex;
  justify-content: center;
}
</style>
