<template>
  <CoreContainer fluid>
    <CoreRow v-if="modules.length > 0">
      <CoreSheet>
        <span class="text-h5"> {{ $t(modulesTitle) }} </span>
      </CoreSheet>
    </CoreRow>
    <CoreRow v-if="modules.length > 0">
      <CoreColumn v-for="(variant, i) in modules" :key="i" cols="12" sm="6" md="4" xl="2">
        <CoreCard
          class="mx-auto w-100 h-100 d-flex flex-column"
          :to="variant.to"
          elevated-card
          card-with-bg-color
          style="min-height: 155px"
        >
          <CoreCardItem>
            <div>
              <div class="text-overline mb-1" />
              <div class="text-h6 mb-1">
                {{ $t(`workbench.modules.${variant.key}.title`) }}
              </div>
              <div class="text-caption">
                {{ $t(`workbench.modules.${variant.key}.text`) }}
              </div>
            </div>
          </CoreCardItem>

          <CoreCardActions class="mt-auto mb-0 px-4">
            <div>{{ $t(`workbench.modules.${variant.key}.button`) }}</div>
            <CoreIcon color="theme" size="small" class="ml-auto"> fas fa-arrow-right </CoreIcon>
          </CoreCardActions>
        </CoreCard>
      </CoreColumn>
    </CoreRow>

    <CoreRow>
      <CoreSheet>
        <span class="text-h5"> {{ $t(legacyTitle) }} </span>
      </CoreSheet>
    </CoreRow>
    <CoreRow>
      <CoreColumn v-for="(variant, i) in legacy" :key="i" cols="12" sm="6" md="4" xl="2">
        <CoreCard
          class="mx-auto w-100 h-100 d-flex flex-column"
          :to="variant.to"
          elevated-card
          card-with-bg-color
          style="min-height: 155px"
        >
          <CoreCardItem>
            <div>
              <div class="text-overline mb-1" />
              <div class="text-h6 mb-1">
                {{ $t(`workbench.legacy.${variant.key}.title`) }}
              </div>
              <div class="text-caption">
                {{ $t(`workbench.legacy.${variant.key}.text`) }}
              </div>
            </div>
          </CoreCardItem>

          <CoreCardActions class="mt-auto mb-0 px-4">
            <div>{{ $t(`workbench.legacy.${variant.key}.button`) }}</div>
            <CoreIcon color="theme" size="small" class="ml-auto"> fas fa-arrow-right </CoreIcon>
          </CoreCardActions>
        </CoreCard>
      </CoreColumn>
    </CoreRow>

    <CoreRow>
      <CoreSheet>
        <span class="text-h5"> {{ $t(libraryTitle) }} </span>
      </CoreSheet>
    </CoreRow>
    <CoreRow>
      <CoreColumn v-for="(variant, i) in library" :key="i" cols="12" sm="6" md="4" xl="2">
        <CoreCard
          class="mx-auto w-100 h-100 d-flex flex-column"
          :to="variant.to"
          elevated-card
          card-with-bg-color
          style="min-height: 155px"
        >
          <CoreCardItem>
            <div>
              <div class="text-overline mb-1" />
              <div class="text-h6 mb-1">
                {{ $t(`workbench.library.${variant.key}.title`) }}
              </div>
              <div class="text-caption">
                {{ $t(`workbench.library.${variant.key}.text`) }}
              </div>
            </div>
          </CoreCardItem>

          <CoreCardActions class="mt-auto mb-0 px-4">
            <div>{{ $t(`workbench.library.${variant.key}.button`) }}</div>
            <CoreIcon color="theme" size="small" class="ml-auto"> fas fa-arrow-right </CoreIcon>
          </CoreCardActions>
        </CoreCard>
      </CoreColumn>
    </CoreRow>
  </CoreContainer>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import { useStore } from "vuex";

import { envWorkbenchCategories } from "@/utils/env";

function filterForEnv(arr: any[]) {
  return arr.filter((e) =>
    envWorkbenchCategories.map((item) => item.toLowerCase()).includes(e.envKey.toLowerCase()),
  );
}

const store = useStore();
const hasCurrentMemberPermission = store.getters["members/hasPermission"] as (
  permission: string,
) => boolean;
function filterForPermission(arr: { requiresOnePermissionOf: string[] }[]) {
  return arr.filter((e) =>
    e.requiresOnePermissionOf.some((permission) => hasCurrentMemberPermission(permission)),
  );
}

const modulesTitle = "workbench.modules.title";
const modulesDict = [
  {
    key: "dataMappings",
    to: "workbench/data-mappings",
    envKey: "dataMappings",
    requiresOnePermissionOf: ["createDataMapping", "readDataMapping", "deleteDataMapping"],
  },
  {
    key: "modules",
    to: "workbench/modules",
    envKey: "modules",
    requiresOnePermissionOf: ["readModule", "createModule", "deleteModule", "updateModule"],
  },
];

const modules = computed(() => filterForPermission(filterForEnv(modulesDict)));

const legacyTitle = "workbench.legacy.title";
const legacyDict = [
  {
    key: "devices",
    to: "workbench/devices",
    envKey: "devices",
    requiresOnePermissionOf: ["readDevice", "createDevice", "deleteDevice", "writeDevice"],
  },
  {
    key: "charts",
    to: "workbench/charts",
    envKey: "charts",
    requiresOnePermissionOf: ["readDevice", "createDevice", "deleteDevice", "writeDevice"],
  },
  {
    key: "anomaly",
    to: "workbench/anomaly-detection",
    envKey: "anomaly detection",
    requiresOnePermissionOf: ["readAI", "createAI", "deleteAI", "writeAI"],
  },
  {
    key: "ml",
    to: "workbench/models",
    envKey: "mpc",
    requiresOnePermissionOf: ["readAI", "createAI", "deleteAI", "writeAI"],
  },
];

const legacy = computed(() => filterForPermission(filterForEnv(legacyDict)));

const libraryTitle = "workbench.library.title";
const libraryDict = [
  { key: "devices", to: "workbench/devices-library", envKey: "devices" },
  { key: "ml", to: "workbench/aiml-library", envKey: "mpc" },
];
const library = computed(() => filterForEnv(libraryDict));
</script>
