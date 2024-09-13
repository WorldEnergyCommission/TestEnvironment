<template>
  <div v-if="!isFetching || !dataMappingsEnabled" class="project-favorites">
    <CoreContainer class="pa-0" fluid>
      <CoreRow>
        <CoreColumn :class="[$vuetify.display.mobile ? 'pt-0' : 'py-0']" cols="12">
          <GeneralInfoBanner />
        </CoreColumn>
        <!-- Members Widget is not really usefull -->
        <!-- <CoreColumn :class="[$vuetify.display.mobile ? 'pt-0' : 'py-0']" cols="12" lg="4">
          <MembersWidget />
        </CoreColumn> -->
      </CoreRow>
    </CoreContainer>
    <CoreContainer v-if="showReportBanner" class="mt-6 px-0" fluid>
      <ReportModuleBody :data="reportModuleData" />
    </CoreContainer>
    <!-- render here devices -->
    <!-- if display size smaller or equal to mobile display size, render devices in flex grid -->
    <!-- if display size bigger than mobile display size, render in Drag and Drop grid -->
    <div :style="$vuetify.display.mobile ? 'padding: 20px;' : ''" class="devices-dnd-grid-wrapper">
      <DevicesList v-if="devicesFilter.length" v-bind="{ devicesByRoomLocal: favoritesDevices }" />
      <DevicesListFavorites v-else />
    </div>
  </div>
  <CircleSpinner v-else :size="80" color="accent" />
</template>

<script lang="ts" setup>
/**
 * Favorites page, here we see all devices, MPC, charts which was added to favorites
 */
import { onMounted, computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

import { IDevice } from "@/store/modules/devices/types";
import { RootState } from "@/store/types";
import CircleSpinner from "@/ui/components/components/CenteredCircleSpinner.vue";
import GeneralInfoBanner from "@/ui/components/components/GeneralInfoBanner.vue";
import MembersWidget from "@/ui/components/components/MembersWidget.vue";
import {
  ReportModuleBody,
  useReportModuleData,
} from "@/ui/components/devices/modules/ReportModule";
import DevicesList from "@/ui/components/lists/DevicesList/index.vue";
import DevicesListFavorites from "@/ui/components/lists/DevicesListFavorites/index.vue";

const store = useStore();
const route = useRoute();

/** Values from store using computed props  */
const projectsState = computed(() => {
  return (store.state as RootState).projects;
});
const project = computed(() => {
  return projectsState.value.project;
});
const devicesFilter = computed(() => {
  return (store.state as RootState).devices.devicesFilter || "";
});
const favoritesDevices = computed((): Array<IDevice> => {
  return store.getters["devices/favoritesDevices"];
});

const {
  reportModuleData,
  isFetching,
  enabled: dataMappingsEnabled,
} = useReportModuleData(projectsState.value.projectId!);

const showReportBanner = computed(
  () => dataMappingsEnabled && reportModuleData.value && reportModuleData.value.valid,
);

onMounted(async () => {
  // Load measurements, rooms, devices, members, MPC, weather data
  await Promise.allSettled([
    store.dispatch("measurements/fetchMeasurements", route.params.id as string),
    store.dispatch("rooms/fetchRooms", route.params.id as string),
    store.dispatch("devices/fetchDevices", route.params.id as string),
    store.dispatch("members/fetchMembers", route.params.id as string),
    store.dispatch("mpc/fetchMPCListByProject", route.params.id as string),
    store.dispatch("app/fetchWeather", project.value.meta.location),
    store.dispatch("app/fetchWeatherForecast", project.value.meta.location),
  ]);
});
</script>

<style lang="scss" scoped>
.project-favorites {
  .devices-dnd-grid-wrapper {
    width: calc(100% + 40px);
    margin: 0 0 0 -20px;
  }
}
</style>
