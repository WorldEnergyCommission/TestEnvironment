<template>
  <DeviceLayout :device-data="deviceData" device-size="x5h">
    <template #basic-controls>
      <div class="kinetic-power">
        <v-tabs v-model="currentTab" bg-color="transparent" class="pt-2" color="accent">
          <v-tab v-for="(item, index) in cranesList" :key="index">
            <span>{{ $t("devices.KineticPower.menuButtons.crane") }}</span>
            <span class="pl-1">{{ defineTabTitle(item) }}</span>
          </v-tab>
        </v-tabs>

        <div class="crane-view-wrapper">
          <div class="craneViewPart d-flex flex-column">
            <div v-for="(crane, index) in currentCranes" :key="index">
              <K2ETopView
                :key="currentTab"
                :device-data="deviceData.data.mappings.cranes[crane]"
                :index="currentTab * 2 + 1 + index"
              />
            </div>
            <K2ECranePowerInfo
              :device-data="deviceData.data.mappings"
              class="powerInfoStyles flex-grow-1 mt-2"
            />
          </div>
          <!--    TODO: remove 50%, use flex      -->
          <div class="d-flex">
            <div v-for="(crane, index) in currentCranes" :key="index" style="width: 50%">
              <K2ESideView
                :key="currentTab"
                :device-data="deviceData.data.mappings.cranes[crane]"
                :index="currentTab * 2 + 1 + index"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import K2ECranePowerInfo from "@/ui/components/devices/devices/KineticPowerDevice/components/K2ECranePowerInfo.vue";
import K2ESideView from "@/ui/components/devices/devices/KineticPowerDevice/components/K2ESideView.vue";
import K2ETopView from "@/ui/components/devices/devices/KineticPowerDevice/components/K2ETopView.vue";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

export default defineComponent({
  components: {
    DeviceLayout,
    K2ETopView,
    K2ESideView,
    K2ECranePowerInfo,
  },
  props: {
    deviceData: {
      type: Object as PropType<IDevice>,
    },
  },
  data() {
    return {
      currentTab: 0,
    };
  },
  computed: {
    cranesList() {
      const list = Object.keys(this.deviceData!.data.mappings.cranes);
      const splitter = 2;
      const numberOfTabs = Math.ceil(list.length / splitter);
      return [...Array(numberOfTabs)].map((el: any) => list.splice(0, splitter));
    },
    currentCranes() {
      return this.cranesList[this.currentTab];
    },
  },
  methods: {
    defineTabTitle(list: string[]) {
      const numbersList = list.map((el: string) => el.replace(/\D/g, ""));
      return numbersList.join("-");
    },
  },
});
</script>

<style lang="scss">
.kinetic-power {
  width: 100%;
  overflow: hidden;

  .crane-view-wrapper {
    width: 100%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .powerInfoStyles {
    height: 100px;
    width: 100%;
  }
}
</style>
