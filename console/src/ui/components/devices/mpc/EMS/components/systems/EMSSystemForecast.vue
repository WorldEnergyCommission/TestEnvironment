<template>
  <div class="ems-system">
    <FormModal
      :form-title="getSystemTypeTitle"
      @handle-dialog-change="handleSystemModalWindowContent"
    >
      <!-- Circle system representation -->
      <template #activator>
        <Preview
          :actual-value="sumForecastGroupSliderState"
          :battery-s-o-c-value="avgBattery"
          :error-warning-local="showEventGroup"
          :is-battery-s-o-c="icon != null ? false : true"
          :no-data="!sumForecastGroupSliderState"
          :preview-icon="icon ?? undefined"
          :rotating-backlight-color="
            isAnimatedLineFromPointToCenterGroupSliderState
              ? defaultPointColor
              : alternativePointColor
          "
          actual-value-unit="kW"
        />
      </template>
      <!-- Representation of the grid of systems -->
      <template #content>
        <div v-if="numberOfPages > 1" class="d-flex justify-center">
          <NavigationTab
            v-for="page in numberOfPages"
            :key="page"
            :is-active="tab === page - 1"
            :tab-title="defineTabTitle(page, numberOfPages)"
            @click="tab = page - 1"
          />
        </div>
        <div ref="instancesCanvas" class="ems-system-instances-grid">
          <div class="ems-system-instances-grid-row">
            <div
              v-for="(systemInstance, systemInstanceIndex) in instancesTopLineFiltered"
              :key="`${systemInstanceIndex}_${renderKey}`"
              :ref="systemInstance"
            >
              <div
                :class="[
                  { disbaleOpenSettings: systemProps.disableSystemSettings },
                  'system-instance-wrapper',
                ]"
              >
                <EMSArrow
                  v-if="isDataForInstancesAnimatedLineReady"
                  :center="instancesCanvasCenter"
                  :default-point-color="defaultPointColor"
                  :alternative-point-color="alternativePointColor"
                  :canvas-size="instancesCanvasSize"
                  :from-point-to-center-default="fromPointToCenterDefault"
                  :point="instancesCanvasLines[systemInstance]"
                  style="pointer-events: none"
                  :group-slider-state="systemSlider"
                  :all-systems-forecast-data="{
                    [systemInstance]: systemForcastProps?.allSystemsForecastData[systemInstance],
                  }"
                  :system-data="systemProps.systemData"
                  :forecast="true"
                  :points-in-one-line="true"
                />
                <Preview
                  :actual-value="instanceForecastDataValue(systemInstance)"
                  :no-data="!animatedLineActive"
                  :preview-icon="icon ?? undefined"
                  :preview-title="systemProps.systemData[systemInstance].title"
                  :preview-title-position="'top'"
                  :rotating-backlight-color="
                    isAnimatedLineFromPointToCenter ? defaultPointColor : alternativePointColor
                  "
                  actual-value-unit="kW"
                  :battery-s-o-c-value="batterySOC(systemInstance)"
                  :is-battery-s-o-c="icon != null ? false : true"
                />
              </div>
            </div>
          </div>
          <div
            ref="instancesCentralEndpoint"
            :key="`center_${renderKey}`"
            class="ems-system-instances-grid-row"
          >
            <CentralEndpoint />
          </div>
          <div class="ems-system-instances-grid-row">
            <div
              v-for="(systemInstance, systemInstanceIndex) in instancesBottomLineFiltered"
              :key="systemInstanceIndex"
              :ref="systemInstance"
            >
              <div
                :class="[
                  { disbaleOpenSettings: systemProps.disableSystemSettings },
                  'system-instance-wrapper',
                ]"
              >
                <EMSArrow
                  v-if="isDataForInstancesAnimatedLineReady"
                  :center="instancesCanvasCenter"
                  :default-point-color="defaultPointColor"
                  :alternative-point-color="alternativePointColor"
                  :canvas-size="instancesCanvasSize"
                  :from-point-to-center-default="fromPointToCenterDefault"
                  :point="instancesCanvasLines[systemInstance]"
                  style="pointer-events: none"
                  :group-slider-state="systemSlider"
                  :all-systems-forecast-data="{
                    [systemInstance]: systemForcastProps?.allSystemsForecastData[systemInstance],
                  }"
                  :system-data="systemProps.systemData"
                  :forecast="true"
                  :points-in-one-line="true"
                />
                <Preview
                  :actual-value="instanceForecastDataValue(systemInstance)"
                  :no-data="!animatedLineActive"
                  :preview-icon="icon ?? undefined"
                  :preview-title="systemProps.systemData[systemInstance].title"
                  :preview-title-position="'bottom'"
                  :rotating-backlight-color="
                    !isAnimatedLineFromPointToCenter ? lineColor : lineColorReverse
                  "
                  actual-value-unit="kW"
                  :battery-s-o-c-value="batterySOC(systemInstance)"
                  :is-battery-s-o-c="icon != null ? false : true"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="d-flex justify-center">
          <div style="width: 620px">
            <TimeSlider v-model="systemSlider" :items="timeSliderInitArr" />
          </div>
        </div>
      </template>
    </FormModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import EMSSystemUtils from "./EMSSystemUtils";
import EMSArrow from "../EMSArrow.vue";
import CentralEndpoint from "@/ui/components/devices/components/EnergyParts/CentralEndpoint.vue";
import Preview from "@/ui/components/devices/components/EnergyParts/Preview.vue";
import TimeSlider from "@/ui/components/devices/components/EnergyParts/TimeSlider.vue";
import EMSSystemUtilsForecast from "@/ui/components/devices/mpc/EMS/components/systems/EMSSystemUtilsForecast";
import NavigationTab from "@/ui/components/modals/components/NavigationTab.vue";
import FormModal from "@/ui/components/modals/FormModal.vue";

/**
 * Reusable EMS system forecast template, able to render various simple components like PVSystem, etc.
 */
export default defineComponent({
  components: {
    FormModal,
    Preview,
    CentralEndpoint,
    TimeSlider,
    NavigationTab,
    EMSArrow,
  },
  mixins: [EMSSystemUtils, EMSSystemUtilsForecast],
  props: {
    batteryPredictedSOC: Object as PropType<any>,
  },
  data() {
    return {
      systemSlider: 0,
    };
  },
  computed: {
    systemsForecastData() {
      // const currentSystemInstances = [...Array(this.systemCount).keys()].map();

      let obj = {};
      const arr = Array.from({ length: this.systemProps!.systemCount }, (_, i) => i + 1).map(
        (el: any) => `${this.systemForcastProps!.systemName}${el}`,
      );
      arr.forEach((system: string) => {
        obj = { ...obj, ...{ [system]: this.systemForcastProps!.allSystemsForecastData[system] } };
      });
      return obj;
    },
    sumSystemsForecastDataFilteredGroupSliderState() {
      return Object.values(this.systemsForecastData).map((system: any) => {
        if (!system || !system[this.systemForcastProps!.groupSliderState]) {
          return [null, null];
        }
        return system[this.systemForcastProps!.groupSliderState];
      });
    },
    sumForecastGroupSliderState() {
      const values = Object.values(this.sumSystemsForecastDataFilteredGroupSliderState).map(
        (el: any) => el[1],
      );
      const checkEmpty = values.filter((el: any) => typeof el === "number");
      if (checkEmpty.length) {
        const num: any = values.reduce((a: number, b: number) => a + b);
        return +num.toFixed(2);
      } else {
        return 0;
      }
    },
    sumSystemsForecastDataFiltered() {
      return Object.values(this.systemsForecastData).map((system: any) => {
        if (!system || !system[this.systemSlider]) {
          return [null, null];
        }
        return system[this.systemSlider];
      });
    },
    sumForecast() {
      const values = Object.values(this.sumSystemsForecastDataFiltered).map((el: any) => el[1]);
      const checkEmpty = values.filter((el: any) => typeof el === "number");
      if (checkEmpty.length) {
        const num: any = values.reduce((a: number, b: number) => a + b);
        return +num.toFixed(2);
      } else {
        return 0;
      }
    },
    animatedLineActive() {
      return !!this.sumForecast;
    },
    lineWidth() {
      return 2 + 10 * Math.min(1, Math.abs(this.sumForecast ?? 0) / 100);
    },
    timeSliderInitArr() {
      if (this.systemsForecastData) {
        return Object.values(this.systemsForecastData)[0];
      }
      return [];
    },
    /**
     * Return system instance values relative to the selected value on the slider
     * @return {object}
     */
    systemsForecastDataFiltered(): Record<string, number[]> {
      let obj = {};
      Object.entries(this.systemsForecastData).forEach((system: any) => {
        const res = system[1][this.systemSlider];
        obj = { ...obj, ...{ [system[0]]: res } };
      });
      return obj;
    },
    sumForecastGtZero() {
      if (this.sumForecast === null) return false;
      return this.sumForecast > 0;
    },
    sumForecastGtZeroGroupSliderState() {
      if (this.sumForecastGroupSliderState === null) return false;
      return this.sumForecastGroupSliderState > 0;
    },
    isAnimatedLineFromPointToCenter() {
      if (this.fromPointToCenterDefault) {
        return this.sumForecastGtZero;
      }
      return !this.sumForecastGtZero;
    },
    isAnimatedLineFromPointToCenterGroupSliderState() {
      if (this.fromPointToCenterDefault) {
        return this.sumForecastGtZeroGroupSliderState;
      }
      return !this.sumForecastGtZeroGroupSliderState;
    },
    avgBattery() {
      return this.allSystemsArray.reduce(
        (accumulator, system) => accumulator + this.batterySOC(system, true),
        0,
      );
    },
  },
  methods: {
    batterySOC(systemInstance: string, forGroup = false) {
      let sliderVal = this.systemSlider;
      if (forGroup) {
        sliderVal = this.systemForcastProps!.groupSliderState;
      }

      if (
        !this.batteryPredictedSOC ||
        !this.batteryPredictedSOC[systemInstance] ||
        !this.batteryPredictedSOC[systemInstance][sliderVal] ||
        !this.batteryPredictedSOC[systemInstance][sliderVal][1]
      ) {
        return 0;
      }
      return Math.floor(this.batteryPredictedSOC[systemInstance][sliderVal][1]);
    },
    instanceForecastDataValue(systemInstance: string) {
      if (!Array.isArray(this.systemsForecastDataFiltered[systemInstance])) return NaN;
      return this.systemsForecastDataFiltered[systemInstance][1];
    },
  },
});
</script>

<style lang="scss">
.disbaleOpenSettings {
  pointer-events: none;
}
</style>
