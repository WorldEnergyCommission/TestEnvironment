<template>
  <div class="d-flex">
    <CoreTooltip :max-width="250" location="bottom">
      <template #activator="{ props }">
        <div v-bind="props" @mouseenter="doesHover = true" @mouseleave="doesHover = false">
          <div class="ml-2">
            {{ offlineTimerMessage }}
          </div>
        </div>
      </template>
      <div class="last-online-timestamp">
        <div>
          <span>{{ $t("uiComponents.offlineTimerAppBar.headerText") }}</span>
          <span class="pl-1">{{ offlineTimerMessageTooltip }}</span>
        </div>
        <div class="pt-2">
          {{ $t("uiComponents.offlineTimerAppBar.warningText") }}
        </div>
      </div>
    </CoreTooltip>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { RootState } from "@/store/types";
import { Time } from "@/ui/mixins/time";

/**
 * Component that represent offline timer.
 * Shows how much time has passed since last mqtt connection of project.
 */
export default defineComponent({
  mixins: [Time],
  data() {
    const timer: any = null;

    return {
      doesHover: false,
      timer,
      offlineTimerMessage: "",
      offlineTimerMessageTooltip: "",
      delay: 60000,
    };
  },
  computed: {
    projectsState() {
      return (this.$store.state as RootState).projects;
    },
    projectName() {
      return this.projectsState.project.name;
    },
    lastHeartbeatMessage() {
      return this.projectsState.lastHeartbeatMessage;
    },
    hourTranslation() {
      return this.$t("uiComponents.offlineTimerAppBar.hourTranslation");
    },
    minuteTranslation() {
      return this.$t("uiComponents.offlineTimerAppBar.minuteTranslation");
    },
    dayTranslation() {
      return this.$t("uiComponents.offlineTimerAppBar.hourTranslation");
    },
  },
  watch: {
    projectName: [
      {
        handler: "onRouteChange",
      },
    ],
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    /**
     * Converts time to short note
     * @param time seconds
     * @return {string} Example: 2 Day/s...
     */
    getDateShort(time: number) {
      const { days, hours, minutes } = this.getDateFromSeconds(time);

      const hoursStr = hours ? `${hours} ${this.hourTranslation}` : "";
      const minutesStr = minutes ? `${minutes} ${this.minuteTranslation}` : "";

      if (days) {
        return `${days} ${this.dayTranslation}`;
      } else if (hours) {
        return hoursStr;
      } else {
        return minutesStr;
      }
    },
    /**
     * Converts time to long note
     * @param time seconds
     * @return {string} Example: 2 Day/s 2 Hour/s 2 Minute/s
     */
    getDateLong(time: number) {
      const { days, hours, minutes } = this.getDateFromSeconds(time);

      const dayStr = days ? `${days} ${this.dayTranslation}, ` : "";
      const hoursStr = hours ? `${hours} ${this.hourTranslation}, ` : "";
      const minutesStr = minutes ? `${minutes} ${this.minuteTranslation}` : "";

      return `${dayStr}${hoursStr}${minutesStr}`;
    },
    /**
     * Loads offline timer value according to last heartbeat message
     */
    loadOfflineTimer() {
      if (this.timer) clearInterval(this.timer);

      this.timer = setInterval(() => {
        const current = Math.trunc(new Date().getTime() / 1000);
        const lastHB = Math.trunc(this.lastHeartbeatMessage / 1000);

        if (!this.lastHeartbeatMessage) this.offlineTimerMessage = "";
        else {
          const timeDifference = current - lastHB;
          this.offlineTimerMessage = timeDifference > 60 ? this.getDateShort(timeDifference) : "";
          this.offlineTimerMessageTooltip =
            timeDifference > 60 ? this.getDateLong(timeDifference) : "";
        }
      }, this.delay);
    },
    onRouteChange(val: string | undefined) {
      if (val) this.loadOfflineTimer();
      else {
        this.offlineTimerMessage = "";
        this.offlineTimerMessageTooltip = "";
        clearInterval(this.timer);
      }
    },
  },
});
</script>

<style lang="scss" scoped></style>
