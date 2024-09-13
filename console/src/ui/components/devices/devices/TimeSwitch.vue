<template>
  <DeviceLayout
    :device-data="deviceData"
    :settings-modal-width="700"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #custom-icon>
      <CoreIcon>mdi:mdi-clipboard-text-clock-outline</CoreIcon>
    </template>

    <template #basic-controls>
      <div class="time-switch d-flex flex-column align-start pl-5">
        <CoreRow>
          <CoreColumn>
            <SimpleSwitchBase
              :variable-data="deviceData?.data.mappings"
              class="py-0 my-0"
              instance="TimeSwitchControls"
              style="margin-left: 10px"
              :is-preview="isPreview"
              :label="
                $t(`devices.TimeSwitch.settingsView.actionOn`) +
                '/' +
                $t(`devices.TimeSwitch.settingsView.actionOff`)
              "
              :default-value="settings.isActive"
            />
          </CoreColumn>
        </CoreRow>
        <CoreRow v-if="settings.schedule" :dense="true">
          <CoreColumn class="line-height">
            {{ settings.schedule.length }} {{ $t("devices.TimeSwitch.mainView.scheduledActions") }}
          </CoreColumn>
        </CoreRow>
        <CoreRow v-if="status != undefined" :dense="true">
          <CoreColumn>
            <StatusIndicator :status="status == 1" class="indicator mr-2" :is-preview="isPreview" />
            {{ $t("devices.TimeSwitch.settingsView.status") }}
          </CoreColumn>
        </CoreRow>
      </div>
    </template>

    <template #settings-view>
      <TimeSwitchSchedule
        :schedule="settings.schedule"
        :is-preview="isPreview"
        :loading="updatingSchedule"
        @update:schedule="updateSettings"
      />
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import SimpleSwitchBase from "./base/SimpleSwitchBase.vue";
import { IMeasurementGetter } from "@/store/modules/measurements/types";
import StatusIndicator from "@/ui/components/components/StatusIndicator.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import TimeSwitchSchedule from "@/ui/components/modals/ManageTimeSwitch/TimeSwitchSchedule.vue";
import { ITimeSwitchSettings, Schedule } from "@/ui/components/modals/ManageTimeSwitch/types";
import { MappingsParser } from "@/utils/MappingsParser";

/**
 * A switch device, that configures the schedule, which is then used by backend worker to update related data streams.
 * Mappings :
 *    - TimeSwitch_on, TimeSwitch_off - mappings for change impulse signals
 *    - TimeSwitch_state - (optional) current status displayed by the status indicator. The status is not updated by the backend worker.
 */
export default defineComponent({
  components: {
    DeviceLayout,
    TimeSwitchSchedule,
    StatusIndicator,
    SimpleSwitchBase,
  },
  extends: DeviceBase,
  mixins: [MappingsParser],
  data() {
    return {
      instanceName: "TimeSwitch",
      updatingSchedule: false,
    };
  },
  computed: {
    settings() {
      return (this.deviceData!.data.settings ?? {
        isActive: false,
        schedule: [],
      }) as ITimeSwitchSettings;
    },
    /**
     * status for indicator
     */
    status() {
      return this.measurement(this.parsedMappings.state);
    },
    measurement(): IMeasurementGetter {
      return this.$store.getters["measurements/measurement"];
    },
  },
  methods: {
    updateSettings(schedule: Schedule, isActive?: boolean) {
      this.updatingSchedule = !this.isPreview;
      const copy = JSON.parse(JSON.stringify(this.deviceData!));
      copy.data.settings = {
        schedule,
        isActive: isActive ?? this.settings.isActive,
      };
      if (!this.isPreview) {
        this.updateDevice(copy).finally(() => {
          this.updatingSchedule = false;
        });
      }
    },
    updateDevice(control: any): Promise<void> {
      return this.$store.dispatch("devices/updateDevice", control);
    },
  },
});
</script>

<style scoped>
.time-switch {
  width: 100%;
}

.indicator {
  display: inline-block;
}

.line-height {
  line-height: 1;
}
</style>
