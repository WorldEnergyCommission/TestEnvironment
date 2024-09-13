<template>
  <div class="ems-system">
    <FormModal
      :form-title="getSystemTypeTitle"
      @handle-dialog-change="handleSystemModalWindowContent"
    >
      <!-- Circle system representation -->
      <template #activator>
        <Preview
          :actual-value="localisation"
          :battery-s-o-c-value="avg ?? undefined"
          :error-warning-local="showEventGroup"
          :is-battery-s-o-c="icon != null ? false : true"
          :no-data="!sum"
          :preview-icon="icon ?? undefined"
          :rotating-backlight-color="defaultMode ? defaultPointColor : alternativePointColor"
          actual-value-unit="kW"
          :overlay="overlay"
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
                <slot
                  :forecast-data="systemProps.systemData"
                  :instances-canvas-center="instancesCanvasCenter"
                  :instances-canvas-lines="instancesCanvasLines"
                  :instances-canvas-size="instancesCanvasSize"
                  :is-data-for-instances-animated-line-ready="isDataForInstancesAnimatedLineReady"
                  :line-color="lineColor"
                  :line-color-reverse="lineColorReverse"
                  :system-data="systemProps.systemData"
                  :system-type-string="systemProps.systemTypeString"
                  :system-instance="systemInstance"
                  name="instanceView"
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
                <slot
                  :instances-canvas-center="instancesCanvasCenter"
                  :instances-canvas-lines="instancesCanvasLines"
                  :instances-canvas-size="instancesCanvasSize"
                  :is-data-for-instances-animated-line-ready="isDataForInstancesAnimatedLineReady"
                  :line-color="lineColor"
                  :line-color-reverse="lineColorReverse"
                  :system-data="systemProps.systemData"
                  :system-instance="systemInstance"
                  name="instanceView"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </FormModal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import CentralEndpoint from "@/ui/components/devices/components/EnergyParts/CentralEndpoint.vue";
import Preview from "@/ui/components/devices/components/EnergyParts/Preview.vue";
import EMSSystemUtils from "@/ui/components/devices/mpc/EMS/components/systems/EMSSystemUtils";
import NavigationTab from "@/ui/components/modals/components/NavigationTab.vue";
import FormModal from "@/ui/components/modals/FormModal.vue";

/**
 * Reusable EMS system template, able to render various simple components like PVSystem, etc.
 */
export default defineComponent({
  components: {
    FormModal,
    Preview,
    CentralEndpoint,
    NavigationTab,
  },
  extends: EMSSystemUtils,
  props: {
    instanceViewLabel: String,
    overlay: { default: false, type: Boolean },
  },
  data() {
    return {
      showOutputValue: false,
    };
  },
  computed: {
    /**
     * Gets the total value of the systems power variable.
     * @return {number|null} sum of systems power
     */
    sum() {
      const res = Object.values(this.systemProps!.systemData).map((item: any) =>
        this.measurements.get(item.power),
      );
      const filtered = res.filter((el: any) => typeof el === "number");
      return filtered.length ? (filtered.reduce((a: any, b: any) => a + b) as number) : null;
    },
    mod() {
      return +`${Math.round(+`${this.sum}e+3`)}e-3`;
    },
    filtered(): any {
      return Number.isInteger(this.mod) ? this.mod : this.mod.toFixed(2);
    },
    localisation() {
      if (this.filtered === "NaN") {
        return 0;
      }
      return Intl.NumberFormat("de-GE").format(this.filtered);
    },
    /**
     * TODO: this should be refactored because of dupblication....
     *
     */
    outputValue() {
      if (this.filtered === "NaN") {
        return 0;
      }
      return Intl.NumberFormat("de-GE").format(this.filtered);
    },
    defaultMode() {
      if (typeof this.sum !== "number") return false;

      if (this.fromPointToCenterDefault) {
        return this.sum > 0;
      }

      return this.sum < 0;
    },
    animatedLineActive() {
      return !(this.sum === 0 || typeof this.sum !== "number");
    },
    instancesTopLine() {
      return Object.keys(this.systemProps!.systemData).slice(0, 5);
    },
    instancesBottomLine() {
      return Object.keys(this.systemProps!.systemData).slice(5, 10);
    },
    lineWidth() {
      return 2 + 10 * Math.min(1, (Math.abs(this.sum ?? 0) as number) / 100);
    },
    instanceViewName() {
      if (this.systemProps!.systemData.evChargingStation1) return "evChargingStation";
      return "EMSSystemInstanceView";
    },
    sumGtZero() {
      if (this.sum === null) return false;
      return this.sum > 0;
    },
  },
  created() {
    let res = Object.values(this.systemProps!.systemData).map((item: any) => {
      // check if item.power variable has value
      return item.power ? this.measurements.get(item.power) : null;
    });
    res = res.filter((element: any) => typeof element === "number"); // if element not a number we dont show it
    this.showOutputValue = !!res.length;
  },
});
</script>

<style lang="scss">
.disbaleOpenSettings {
  pointer-events: none;
}

.ems-actual-view {
  width: 100%;
  height: 650px;
  display: flex;
  flex-direction: column;
  position: relative;

  .ems-actual-view-row {
    flex-grow: 1;
    display: flex;
    justify-content: space-around;
    align-items: center;
    min-height: 216px;

    .battery-system-wrapper {
      width: 100px;

      @media all and (max-width: 1450px) and (min-width: 1264px) {
        width: 80px;
      }

      @media all and (max-width: 900px) {
        width: 80px;
      }

      @media all and (max-width: 800px) {
        width: 60px;
      }
    }

    &:last-of-type {
      .system-count {
        top: 90px;
        left: -20px;

        @media all and (max-width: 900px) {
          top: 70px;
          left: -10px;
        }

        @media all and (max-width: 800px) {
          top: 56px;
          left: -15px;
        }
      }
    }
  }
}

// systems styles
.ems-system-instances-grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  .ems-system-instances-grid-row {
    min-height: 108px;
    @media (min-width: 400px) {
      min-height: 216px;
    }
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
}

// system preview styles
.ems-system-preview {
  position: relative;

  .rotating-backlight {
    z-index: 3;
  }

  .ems-system-preview-content {
    width: 100px;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: var(--v-secondaryDeviceBackground-base);
    border-radius: 50%;
    position: relative;
    z-index: 2;
    font-size: 12px;
  }

  .animated-line {
    z-index: 1;
  }

  .show-event-base {
    border-radius: 50% !important;
    z-index: 3;
  }
}

// system instance preview styles
.system-instance-view-content {
  min-height: 100px;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
