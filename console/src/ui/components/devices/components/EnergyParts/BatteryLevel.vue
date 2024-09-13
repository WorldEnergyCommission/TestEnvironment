<template>
  <div class="battery-level">
    <div class="battery-level-cap" />
    <div class="battery-level-body">
      <div class="battery-level-content">
        <div class="battery-level-value">
          <span>{{ boundedBatteryState }}</span>
          <span v-if="batteryState">%</span>
        </div>
        <div :style="`width: ${batteryState}%`" class="battery-level-scale" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * Component that represent battery
 * Used in EMS, EnergyView device
 */
export default defineComponent({
  props: {
    batteryState: { default: 10, type: Number },
  },
  computed: {
    /**
     * Checks if the battery value is outside the limits and sets to agreed boundaries
     * @return {number} battery level
     */
    boundedBatteryState() {
      if (!this.batteryState) {
        return;
      }
      if (this.batteryState > 100) {
        return 100;
      } else if (this.batteryState < 0) {
        return 0;
      } else {
        return Math.round(this.batteryState * 100) / 100;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.battery-level {
  position: relative;

  .battery-level-cap {
    content: "";
    display: block;
    position: absolute;
    width: 8px;
    height: 8px;
    background: rgb(var(--v-theme-lynusText));
    left: calc(100% - 4px);
    top: 12px;
    border-radius: 50%;
    z-index: 1;
    @media all and (max-width: 900px) {
      display: none;
    }
  }

  .battery-level-body {
    width: 50px;
    height: 30px;
    border: 2px solid rgb(var(--v-theme-lynusText));
    background: rgb(var(--v-theme-projectBackground));
    border-radius: 10px;
    position: relative;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: center;
    @media all and (max-width: 1450px) and (min-width: 1264px) {
      width: 50px;
      height: 25px;
    }
    @media all and (max-width: 900px) {
      width: 50px;
      height: 25px;
    }
    @media all and (max-width: 800px) {
      width: 45px;
      height: 20px;
    }

    .battery-level-content {
      width: 100%;
      height: 100%;
      background: transparent;
      border-radius: 5px;
      position: absolute;
      overflow: hidden;
      z-index: 3;

      .battery-level-value {
        position: absolute;
        z-index: 1;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: rgb(var(--v-theme-text));
        @media all and (max-width: 800px) {
          font-size: 8px;
        }
      }

      .battery-level-scale {
        position: absolute;
        background: rgb(var(--v-theme-accent));
        top: 0;
        left: 0;
        height: 100%;
        border-radius: 7px;
      }
    }
  }
}
</style>
