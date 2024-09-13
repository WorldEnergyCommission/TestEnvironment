<template>
  <div :class="['device-layout', `device-size-${deviceSize}`]">
    <DeviceCardWrapper>
      <template #title>
        <slot name="title">
          <div class="flex-grow-1">
            {{ isPreview ? previewData.name : deviceData.name }}
          </div>
        </slot>
        <div>
          <slot name="actions" />
        </div>
      </template>
      <template #actions>
        <DeviceActions
          v-if="deviceData && !isPreview"
          :device="deviceData"
          :is-settings-view="isSettingsView"
          @rerender-device="$emit('rerenderDevice', $event)"
          @switch-settings-view="switchSettingsView"
        />
        <!-- shows only for devices previews -->
        <PreviewActions
          v-if="previewData && isPreview"
          :device-type="previewData.type"
          :is-settings-view="isSettingsView"
          @switch-settings-view="switchSettingsView"
        />
      </template>
      <template #content>
        <div class="device-content">
          <!-- flashing frame signalling errors or warnings -->
          <ShowEventBase
            v-if="!isPreview"
            :variable-data="
              showEventVariable !== null ? showEventVariable : deviceData.data.mappings
            "
            instance="ShowEvent"
          />

          <!-- icon -->
          <div
            v-if="$slots['custom-icon'] || deviceIcon"
            :class="['device-icon', { 'align-start': deviceSize !== 'default' }]"
          >
            <lynus-icon
              v-if="deviceIcon"
              :color="deviceIconTheme"
              :name="deviceIcon"
              :size="deviceIconSize"
            />
            <slot name="custom-icon" />
          </div>

          <!-- body of every device, list of basic controls -->
          <div
            :style="isMPCLayout ? 'align-items: stretch;' : 'align-items: center;'"
            class="device-basic-controls"
          >
            <slot name="basic-controls" />
          </div>

          <!--
        device actions list,
        also renders additional actions if they was added to the appropriate slot
      -->
          <div class="device-actions">
            <div class="device-actions-additional">
              <slot name="additional-actions" />
              <div v-if="isPreview" class="pt-2 d-flex justify-center">
                <DeviceDescription v-bind="{ description }" />
              </div>
              <!-- drag and drop button, need to move device in dnd grid -->
              <div v-if="!isPreview" class="pt-2 d-flex justify-center">
                <slot name="dnd" />
              </div>
              <!-- modal window where charts renders -->
              <ChartsViewModal
                v-if="isCharts"
                :button-size-class="chartsButtonSize"
                :window-width="chartsModalWidth"
                class="pt-2"
              >
                <template #content>
                  <slot name="charts-view" />
                </template>
              </ChartsViewModal>
            </div>
          </div>
        </div>
      </template>
    </DeviceCardWrapper>

    <!-- modal window where settings form renders -->
    <SettingsView
      v-bind="{ deviceData: isPreview ? previewData : deviceData }"
      v-model="isSettingsView"
      :modal-width="settingsModalWidth"
      @switch-settings-view="switchSettingsView"
    >
      <template #content>
        <slot name="settings-view" />
      </template>
    </SettingsView>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import DeviceActions from "@/ui/components/devices/actions/DeviceActions.vue";
import DeviceDescription from "@/ui/components/devices/actions/DeviceDescription.vue";
import PreviewActions from "@/ui/components/devices/actions/PreviewActions.vue";
import SettingsView from "@/ui/components/devices/components/SettingsView.vue";
import ShowEventBase from "@/ui/components/devices/devices/base/ShowEventBase.vue";
import DeviceCardWrapper from "@/ui/components/devices/layout/DeviceCardWrapper";
import DeviceLayout from "@/ui/components/devices/layout/DeviceLayout";
import ChartsViewModal from "@/ui/components/devices/mpc/components/ChartsViewModal.vue";

/**
 * Component that defines the structure of the device
 */
export default defineComponent({
  components: {
    SettingsView,
    DeviceActions,
    ShowEventBase,
    PreviewActions,
    DeviceDescription,
    ChartsViewModal,
    DeviceCardWrapper,
  },
  extends: DeviceLayout,
  emits: ["rerenderDevice"],
});
</script>

<style lang="scss" scoped>
@import "./src/ui/scss/variables";
@import "./CommonDeviceLayoutStyling";

.device-layout {
  width: 100%;
  height: 100%;

  .device-content {
    display: flex;
    flex-direction: row;
    height: calc(100% - 45px);
  }

  .device-actions {
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 36px;
    height: 100%;

    .device-actions-additional {
      flex-grow: 1;
      display: flex;
      justify-content: flex-end;
      flex-direction: column;
    }
  }

  .device-icon {
    padding: 5px 0;
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      text-align: center;
    }
  }

  .device-basic-controls {
    overflow: visible !important;
    position: relative; // important for devices with canvas'
    flex-grow: 1;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    z-index: 3;
    min-height: 70px;
  }

  .device-dnd-button {
    position: absolute;
    bottom: 5px;
    right: 5px;
  }
}
// are device sizes really needed? - JP
// maybe w-100 + h-100 solves
// .device-size-default {
//   height: 138px;

//   .device-layout__body {
//     height: 110px;
//   }
// }

// .device-size-x2h {
//   height: 296px;

//   .device-layout__body {
//     height: 268px;
//   }
// }

// .device-size-x4h {
//   height: 730px;

//   .device-layout__body {
//     height: 702px;
//   }
// }

// .device-size-x5h {
//   height: 770px;

//   .device-layout__body {
//     height: 742px;
//   }
// }
</style>
