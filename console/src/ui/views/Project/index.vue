<template>
  <div class="project-index bottom-without-safe">
    <router-view v-if="isProjectLoaded" v-slot="{ Component }">
      <CoreSlideXTransition mode="out-in">
        <Suspense>
          <component :is="Component" />
          <template #fallback>
            <div class="project-index__loader">
              <CircleSpinner :size="80" color="accent" />
            </div>
          </template>
        </Suspense>
      </CoreSlideXTransition>
    </router-view>
    <div v-else class="project-index__loader">
      <CircleSpinner :size="80" color="accent" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Project page.
 * This page is wrapper of Favorites, Areas, Devices Library, AIML Library, Variables,
 * Workbench, Settings, Rules, Report, Event List pages
 */
import { Ref, computed, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { fetchEventSource } from "@microsoft/fetch-event-source";

import { IRecord } from "@/store/modules/devices/types";
import { RootState } from "@/store/types";
import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import { envApi } from "@/utils/env";

// Constants
const store = useStore();
const route = useRoute();
const timer: any = ref(undefined);
const isProjectLoaded = ref(false);

// Computed Properties
const projectsState = computed(() => {
  return (store.state as RootState).projects;
});
const appState = computed(() => {
  return (store.state as RootState).app;
});
const lastHeartbeatMessage = computed({
  get() {
    return projectsState.value.lastHeartbeatMessage;
  },
  set(value: number) {
    setLastHeartbeatMessage(value);
  },
});
const project = computed(() => {
  return projectsState.value.project;
});
const lastConnectivity = computed(() => {
  const last = project.value.connectivity?.last;
  return last ? new Date(last).getTime() : 0;
});
const user = computed(() => {
  return appState.value.user;
});
const hasCurrentMemberPermission = computed(() => (permission: string) => {
  return store.getters["members/hasPermission"](permission);
});
const isLoggedIn = computed(() => {
  return appState.value.auth.accessToken !== "";
});

watch(
  () => appState.value.auth.accessToken,
  async () => {
    await subscribeToSSE();
  },
);
const abortSSEController = ref(null) as Ref<AbortController | null>;

onMounted(async () => {
  await subscribeToSSE();
});
onBeforeUnmount(abortSSE);

function abortSSE() {
  abortSSEController.value && abortSSEController.value.abort();
}

async function subscribeToSSE() {
  abortSSEController.value && abortSSEController.value.abort();
  abortSSEController.value = new AbortController();
  fetchEventSource(`${envApi}/projects/${route.params.id}/measurements/all/subscribe`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${appState.value.auth.accessToken}`,
    },
    onmessage(msg) {
      if (msg.event === "mqtt") {
        const isHeartbeatMessage: boolean = msg.data.includes('"n":""');

        // if heartbeat message arrives, set status to true
        if (isHeartbeatMessage) {
          setLastHeartbeatMessage(Date.now());
          setProjectStatus(true);
        }

        if (route.meta?.mqtt) {
          const records = JSON.parse(msg.data) as any[];
          records.forEach((record) => setMeasurement(record));
        }
      }
    },
    signal: abortSSEController.value.signal,
  });
}

const initialize = async () => {
  if (!isLoggedIn.value) {
    return;
  }

  const projectId = route.params.id as string;

  setProjectId(projectId);

  await fetchMember({
    memberId: user.value.id,
    projectId: projectId,
  });

  await loadProject(projectId);

  if (hasCurrentMemberPermission.value("listAlerts")) {
    await loadEvents({ page: 1, bol: false });
  }

  store.dispatch("dataMappings/fetchDataMappings");
  // check last heartbeat message
  setLastHeartbeatMessage(lastConnectivity.value);

  // set project status to null at startup
  setProjectStatus(null);

  isProjectLoaded.value = true;

  // if it has been more than 60 seconds since the last heartbeat message
  const heartbeatOffset = 60 * 1000;

  timer.value = setInterval(() => {
    const now: number = Date.now();
    const past: number = now - heartbeatOffset;
    const isValid: boolean = now > lastHeartbeatMessage.value && past < lastHeartbeatMessage.value;
    if (!isValid) {
      setProjectStatus(false);
    }
  }, heartbeatOffset);
};

const setLastHeartbeatMessage = (value: number | null) => {
  store.commit("projects/setLastHeartbeatMessage", value);
};

const loadProject = async (projectId: string) => {
  await store.dispatch("projects/loadProject", projectId);
};

const clear = async () => {
  await store.dispatch("app/clear");
};

const fetchMember = async (payload: { memberId: string; projectId: string }) => {
  await store.dispatch("members/fetchMember", payload);
};

const loadEvents = async (payload: { page: number; bol: boolean }) => {
  await store.dispatch("events/loadEvents", payload);
};

const setMeasurement = (record: IRecord) => {
  store.commit("measurements/setMeasurement", record);
};

const setProjectStatus = (status: boolean | null) => {
  store.commit("projects/setProjectStatus", status);
};

const setProjectId = (route: string) => {
  store.commit("projects/setProjectId", route);
};

// Lifecycle Hooks
onMounted(async () => {
  initialize();
});

onUnmounted(async () => {
  await clear();
  setProjectStatus(null);
  clearInterval(timer.value);
});

// Watchers
watch(isLoggedIn, (newValue, oldValue) => {
  if (newValue) {
    initialize(); // Call initialize method if isLoggedIn changes to true
  }
});
</script>

<style lang="scss">
.project-index {
  padding: 20px;
  min-height: 100%;
  position: relative;
  overflow-y: auto !important;
  &__loader {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    position: absolute;
  }
}
</style>
