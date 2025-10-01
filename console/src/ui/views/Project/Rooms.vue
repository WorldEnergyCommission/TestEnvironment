<template>
  <div class="project-areas d-flex flex-column pt-3">
    <template v-if="isRoomsDataLoaded">
      <!-- render here rooms -->
      <!-- if window size smaller or equal to mobile display size, render rooms list in flex grid -->
      <!-- if window size bigger than mobile display size, render rooms list in Drag and Drop grid -->
      <div :class="{ 'sticky-tabs': $vuetify.display.mobile }">
        <RoomsList @handle-room-active-status="handleRoomActiveStatus" />
      </div>
      <!-- render here devices -->
      <!-- if display size smaller or equal to mobile display size, render devices in flex grid -->
      <!-- if display size bigger than mobile display size, render in Drag and Drop grid -->
      <div class="devices-dnd-grid-wrapper flex-grow-1 d-flex">
        <DevicesList
          v-if="devicesFilter.length"
          class="flex-grow-1"
          v-bind="{ devicesByRoomLocal }"
        />
        <swiper
          v-else
          class="flex-grow-1"
          @swiper="onSwiper"
          @slide-change="(swiper) => (window = swiper.activeIndex)"
        >
          <swiper-slide v-for="room in windowedRooms" :key="room.i">
            <DevicesListDnD
              v-if="room.render"
              :current-room-data="room.room"
              :devices-by-room-local="room.devices"
              :is-active="window === room.i"
            />
          </swiper-slide>
        </swiper>
      </div>
      <CoreMenu v-if="showCreateDeviceButton" v-model="isMenuOpen" location="bottom right">
        <template #activator="{ props }">
          <CoreButton
            button-type="primary"
            location="bottom right"
            position="fixed"
            offset
            width="180px"
            size="large"
            :style="{ bottom: '20px', right: '20px', zIndex: 2 }"
            v-bind="props"
            icon-name="plus"
            elevation="2"
          >
            {{ $t("uiComponents.buttons.create") }} ...
          </CoreButton>
        </template>
        <CoreList>
          <component
            :is="item.form"
            v-for="(item, index) in createDeviceOptions"
            :key="index"
            :active-room-id="activeRoomId"
            :form-title="item.formTitle"
            @handle-control="handleWorkbenchButton"
          >
            <CoreListItem link>
              <CoreListItemTitle>{{ item.formTitle }}</CoreListItemTitle>
            </CoreListItem>
          </component>
        </CoreList>
      </CoreMenu>
    </template>
    <div v-else class="project-areas__loader">
      <CircleSpinner :size="80" color="accent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Swiper as SwiperClass } from "swiper/types/index.d.ts";
import { Swiper, SwiperSlide } from "swiper/vue";
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import "swiper/css";
import { useStore } from "vuex";

import { IRoomDndLayout } from "@/store/modules/rooms/types";
import { RootState } from "@/store/types";
import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import DevicesList from "@/ui/components/lists/DevicesList/index.vue";
import DevicesListDnD from "@/ui/components/lists/DevicesListDnD/index.vue";
import RoomsList from "@/ui/components/lists/RoomsList/index.vue";
// eslint-disable-next-line import/order
import {
  envShowCreateDeviceButtonInArea,
  envWorkbenchButtons,
  envWorkbenchCategories,
} from "@/utils/env";

// Constants
const window = ref(0);
const { t } = useI18n();
const store = useStore();
const slider = ref<SwiperClass | null>(null);
const route = useRoute();
const router = useRouter();
const isMenuOpen = ref(false);
const isRoomsDataLoaded = ref(false);
const projectId = route.params.id as string;
const onSwiper = (swiper: SwiperClass) => {
  slider.value = swiper;
};

// Computed Properties
const mpcState = computed(() => (store.state as RootState).mpc);
const activeRoomId = computed(() => {
  return route.params.activeroom;
});
const dndActive = computed(() => store.getters["projects/isDnDActive"]);
const showCreateDeviceButton = computed(
  () =>
    envShowCreateDeviceButtonInArea &&
    (store.state as RootState).members.currentMember &&
    ((store.state as RootState).members?.currentMember?.admin ||
      hasCurrentMemberPermission("createDevice") ||
      hasCurrentMemberPermission("createAI")),
);
const windowedRooms = computed(() =>
  (store.getters["rooms/dndLayout"] as IRoomDndLayout[])
    .slice()
    .sort((a, b) => {
      if (a.x === b.x) {
        return a.y - b.y;
      }
      return a.x - b.x;
    })
    .map((room, index) => {
      const devices = store.getters["devices/devicesByRoom"](room.room.id);
      const render =
        window.value === index || window.value - 1 === index || window.value + 1 === index;
      return {
        room: room.room,
        devices,
        i: index,
        render,
      };
    }),
);
const devicesByRoomLocal = computed(() => {
  return store.getters["devices/devicesByRoom"](activeRoomId.value);
});
const devicesFilter = computed(() => {
  return (store.state as RootState).devices.devicesFilter || "";
});
const createDeviceOptions = computed(() => {
  return [
    {
      id: "device",
      form: "ManageDevice",
      formTitle: t("modals.manageDevice.createDeviceTitle"),
      btnTitle: t("uiComponents.buttons.addDevice"),
      visible: true && hasCurrentMemberPermission("createDevice"),
    },
    {
      id: "aiml",
      form: "ManageAnomalyDetection",
      formTitle: t("modals.manageAnomalyDetection.createAnomalyDetectionTitle"),
      btnTitle: t("uiComponents.buttons.addAnomalyDetection"),
      visible: true && hasCurrentMemberPermission("createAI"),
    },
    {
      id: "charts",
      form: "ManageCharts",
      formTitle: t("modals.manageCharts.createChartTitle"),
      btnTitle: t("uiComponents.buttons.addChart"),
      visible: true && hasCurrentMemberPermission("createDevice"),
    },
    {
      id: "mpc",
      form: "ManageMLModel",
      formTitle: t("modals.manageMLModel.createDeviceTitle"),
      btnTitle: t("uiComponents.buttons.addMlModel"),
      visible: hasCurrentMemberPermission("createAI"),
    },
  ].filter((e) => e.visible && envWorkbenchButtons.includes(e.form));
});

function hasCurrentMemberPermission(permission: string) {
  return store.getters["members/hasPermission"](permission);
}

function handleWorkbenchButton(payload: any) {
  isMenuOpen.value = false;
  const mpcApiTypes: string[] = [
    ...Object.keys(mpcState.value.mlModelTypes),
    ...Object.keys((store.state as RootState).anomalyDetection.anomalyDetectionTypes),
  ];
  const isMpc: boolean = mpcApiTypes.some((type: string) => type === payload.data.type);
  if (isMpc) {
    store.dispatch("mpc/createMCCInstance", payload);
  } else {
    store.dispatch("devices/createDevice", payload);
  }
}

function handleRoomActiveStatus(roomId: string) {
  pushRoomRoute(roomId);
}

function SetWindowOnActiveRoomChange() {
  const i = windowedRooms.value.findIndex((element) => element.room.id === activeRoomId.value);
  slider.value?.slideTo(i);
  window.value = i;
}

function SetActiveRoomOnWindowChange() {
  if (!windowedRooms.value[window.value]?.room) {
    return;
  }

  pushRoomRoute(windowedRooms.value[window.value].room.id);
}

function pushRoomRoute(payload: string) {
  router.push({ path: `/projects/${projectId}/areas/${payload}` });
}

// to refactor and create composable useProjectIdFromRoute()
// Lifecycle Hooks
onMounted(async () => {
  const modulesEnabled = envWorkbenchCategories
    .map((item) => item.toLowerCase())
    .includes("modules");
  const modulesPromise = modulesEnabled
    ? store.dispatch("modules/fetchModulesWihtMappings")
    : Promise.resolve();
  await Promise.allSettled([
    store.dispatch("measurements/fetchMeasurements", projectId),
    store.dispatch("rooms/fetchRooms", projectId),
    store.dispatch("devices/fetchDevices", projectId),
    store.dispatch("mpc/fetchMPCListByProject", projectId),
    modulesPromise,
    store.dispatch("mpc/fetchMPCWeatherStatus"),
  ]).finally(() => {
    isRoomsDataLoaded.value = true;
  });
});

// Watchers
watch(activeRoomId, SetWindowOnActiveRoomChange);
watch(window, SetActiveRoomOnWindowChange);
watch(slider, SetWindowOnActiveRoomChange);
</script>

<script lang="ts">
// <component is=""> only really works with options api!?
import ManageAnomalyDetection from "@/ui/components/modals/ManageAnomalyDetection/ManageAnomalyDetection.vue";
import ManageCharts from "@/ui/components/modals/ManageChartsNew.vue";
import ManageDevice from "@/ui/components/modals/ManageDevice/ManageDevice.vue";
import ManageMLModel from "@/ui/components/modals/ManageMLModel/ManageMLModel.vue";
import ManageRoom from "@/ui/components/modals/ManageRoom.vue";

export default {
  components: {
    ManageAnomalyDetection,
    ManageCharts,
    ManageDevice,
    ManageMLModel,
    ManageRoom,
  },
};
</script>

<style lang="scss">
.project-areas {
  margin-top: -20px;
  min-height: 100%;

  &__loader {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    position: absolute;
  }

  .devices-dnd-grid-wrapper {
    margin: 0 0 0 0;
    padding-bottom: 40px;
  }
}

.swiper-slide-prev {
  max-height: 624px !important;
}

.swiper-slide-next {
  max-height: 624px !important;
}

.swiper-wrapper {
  box-sizing: border-box !important;
}

.sticky-tabs {
  position: -webkit-sticky;
  position: sticky;
  top: -20px;
  z-index: 59;
  padding-top: 10px;
}
</style>
