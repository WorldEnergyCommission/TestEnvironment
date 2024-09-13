<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="music"
    device-size="x2h"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="music-system">
        <div class="d-flex justify-end pb-4">
          <SwitchBase
            :variable-data="deviceData.data.mappings"
            class="pa-0 ma-0"
            instance="Switch"
            :is-preview="isPreview"
          />
        </div>
        <CoreContainer class="pa-0" fluid>
          <CoreRow no-gutters>
            <CoreColumn>
              <div class="d-flex justify-end">
                <PlusBase
                  :is-push-button-behavior="true"
                  :variable-data="deviceData.data.mappings"
                  icon="volume-plus"
                  instance="Plus"
                />
              </div>
              <div class="d-flex justify-center pt-4">
                <PlayBase :variable-data="deviceData.data.mappings" icon="play" instance="Play" />
              </div>
              <div class="d-flex justify-end pt-4">
                <ReverseBase
                  :variable-data="deviceData.data.mappings"
                  icon="previous"
                  instance="Reverse"
                />
              </div>
            </CoreColumn>
            <CoreColumn class="d-flex align-center justify-center">
              <PauseBase :variable-data="deviceData.data.mappings" icon="pause" instance="Pause" />
            </CoreColumn>
            <CoreColumn>
              <div class="d-flex justify-start">
                <MinusBase
                  :is-push-button-behavior="true"
                  :variable-data="deviceData.data.mappings"
                  icon="volume-minus"
                  instance="Minus"
                />
              </div>
              <div class="d-flex justify-center pt-4">
                <StopBase :variable-data="deviceData.data.mappings" icon="stop" instance="Stop" />
              </div>
              <div class="d-flex justify-start pt-4">
                <ForwardBase
                  :variable-data="deviceData.data.mappings"
                  icon="next"
                  instance="Forward"
                />
              </div>
            </CoreColumn>
          </CoreRow>
        </CoreContainer>
      </div>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ForwardBase from "@/ui/components/devices/devices/base/ForwardBase.vue";
import MinusBase from "@/ui/components/devices/devices/base/MinusBase.vue";
import PauseBase from "@/ui/components/devices/devices/base/PauseBase.vue";
import PlayBase from "@/ui/components/devices/devices/base/PlayBase.vue";
import PlusBase from "@/ui/components/devices/devices/base/PlusBase.vue";
import ReverseBase from "@/ui/components/devices/devices/base/ReverseBase.vue";
import StopBase from "@/ui/components/devices/devices/base/StopBase.vue";
import SwitchBase from "@/ui/components/devices/devices/base/SwitchBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
/**
 * Component that represent MusicSystem device
 */
export default defineComponent({
  components: {
    PlusBase,
    MinusBase,
    SwitchBase,
    PlayBase,
    StopBase,
    PauseBase,
    ReverseBase,
    ForwardBase,
    DeviceLayout,
  },
  extends: DeviceBase,
});
</script>

<style lang="scss" scoped>
.music-system {
  width: 100%;
}
</style>
