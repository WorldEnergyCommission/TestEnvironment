<template>
  <div :class="['device-layout', `device-size-${deviceSize}`]">
    <DeviceCardWrapper>
      <template #title>
        {{ isPreview ? previewData.name : deviceData.name }}
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
        <!-- flashing frame signalling errors or warnings -->
        <ShowEventBase
          v-if="!isPreview"
          :variable-data="showEventVariable !== null ? showEventVariable : deviceData.data.mappings"
          instance="ShowEvent"
        />
        <CoreRow style="margin-inline: 0px">
          <!-- icon -->
          <CoreColumn cols="6">
            <lynus-icon
              v-if="deviceIcon"
              :class="['device-icon', { 'align-start': deviceSize !== 'default' }]"
              :color="deviceIconTheme"
              :name="deviceIcon"
              :size="deviceIconSize"
            />
            <slot name="custom-icon" />
          </CoreColumn>
        </CoreRow>
        <!-- body of every device, list of basic controls -->
        <div
          :style="
            isMPCLayout ? 'align-items: stretch; height:100%;' : 'align-items: center; height:100%;'
          "
          class="device-basic-controls d-flex flex-column"
        >
          <slot name="basic-controls" />
        </div>
        <div class="device-actions-additional">
          <slot name="additional-actions" />
          <div v-if="isPreview" class="pe-2 d-flex justify-center">
            <DeviceDescription :description="description" />
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
            class="pt-2 d-flex flex-column-reverse"
          >
            <template #content>
              <slot name="charts-view" />
            </template>
          </ChartsViewModal>
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
  computed: {
    description() {
      return this.$tm("mlModelsDescriptions.EMS");
    },
  },
});
</script>

<style lang="scss" scoped>
@import "./src/ui/scss/variables";

.device-layout {
  width: 100%;
  height: 100%;

  .device-content {
    display: flex;
    flex-direction: row;
    height: 100%;
  }

  .device-actions {
    width: 40px;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 5px 0;
  }

  .device-actions-additional {
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding: 10px;
  }

  .device-icon {
    width: 40px;
    padding: 5px 0;
    display: flex;
    align-items: center;
    align-self: center;

    span {
      min-width: 40px;
      text-align: center;
    }
  }

  .device-basic-controls {
    width: 100%;
    overflow: hidden;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    z-index: 3;
  }

  .device-dnd-button {
    position: absolute;
    bottom: 5px;
    right: 5px;
  }
}
</style>
