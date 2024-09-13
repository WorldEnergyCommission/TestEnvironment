<template>
  <CoreCard class="general-settings">
    <div class="general-settings-title">
      {{ $t("uiComponents.settings.general.title") }}
    </div>
    <CoreForm ref="form" v-model="valid" class="general-settings-form" :disabled="disableAllFields">
      <CoreContainer class="px-0 content" fluid>
        <CoreRow>
          <CoreColumn cols="12" md="6" order-md="1">
            <CoreTextField
              v-model="name"
              :label="$t('uiComponents.settings.general.form.projectName')"
              :rules="[rules.required, rules.counter30]"
              hide-details="auto"
              max-length="30"
              density="comfortable"
            />
          </CoreColumn>
          <CoreColumn cols="12" md="6" order-md="3">
            <CoreTextField
              v-model="description"
              :label="$t('uiComponents.settings.general.form.projectDescription')"
              hide-details="auto"
              max-length="50"
              density="comfortable"
            />
          </CoreColumn>
          <CoreColumn cols="12" md="6" order-md="2">
            <div class="upload-file">
              <div class="d-flex align-center justify-space-between upload-file-wrapper">
                <CoreFileInput
                  v-model="fileObject"
                  :label="$t('uiComponents.settings.general.projectLogo')"
                  class="pa-0 ma-0 upload-file-field"
                  hide-details
                />
                <CoreButton
                  :disabled="
                    !currentMember ||
                    (!currentMember.admin && !hasCurrentMemberPermission('writeProject'))
                  "
                  class="ml-2"
                  button-type="primary"
                  @click="handleProjectImageUpload"
                >
                  {{ $t("uiComponents.buttons.upload") }}
                </CoreButton>
              </div>
              <div class="upload-description">
                {{ $t("uiComponents.settings.general.uploadDescription") }}
              </div>
            </div>
          </CoreColumn>
          <CoreColumn cols="12" md="6" order-md="4">
            <div class="upload-file">
              <div class="d-flex align-center justify-space-between upload-file-wrapper">
                <CoreFileInput
                  v-model="reportImageObject"
                  :label="$t('uiComponents.settings.general.reportLogo')"
                  class="pa-0 ma-0 upload-file-field"
                  hide-details
                />
                <CoreButton
                  :disabled="
                    !currentMember ||
                    (!currentMember.admin && !hasCurrentMemberPermission('writeProject'))
                  "
                  class="ml-2"
                  button-type="primary"
                  @click="handleReportImageUpload"
                >
                  {{ $t("uiComponents.buttons.upload") }}
                </CoreButton>
              </div>
              <div class="upload-description">
                {{ $t("uiComponents.settings.general.uploadDescription") }}
              </div>
            </div>
          </CoreColumn>
          <CoreColumn cols="12" md="6" order-md="5">
            <CoreAutocomplete
              v-model="cityModel"
              :items="placesArr"
              :label="$t('uiComponents.settings.general.form.city')"
              :loading="isFetchingPlaces"
              clearable
              hide-details
              hide-no-data
              hide-selected
              item-title="display_name"
              item-value="coordinates"
              no-filter
              placeholder="Start typing to Search Places"
              return-object
              @update:search="onSearchPlaces"
            />
          </CoreColumn>
          <CoreColumn v-if="envEnableGPSRouter" cols="12" md="6" order-md="6">
            <CoreTextField
              v-model="gpsDeviceID"
              :label="$t('uiComponents.settings.general.routerIdForTracking')"
              hide-details="auto"
              max-length="30"
              density="comfortable"
            />
          </CoreColumn>
          <CoreColumn v-if="showHardwareId" cols="12" md="6" order-md="7">
            <CoreTextField
              v-model="hardwareId"
              :disabled="
                !currentMember ||
                (!currentMember.admin && !hasCurrentMemberPermission('writeProject'))
              "
              :label="$t('uiComponents.settings.general.form.hardwareId')"
              hide-details="auto"
              max-length="30"
              density="comfortable"
            />
          </CoreColumn>
          <CoreColumn cols="12" md="6" order="last">
            <DeleteBanner :text="$t('uiComponents.settings.general.deleteBanner')">
              <DeleteModalForm
                v-if="
                  currentMember &&
                  (currentMember.admin || hasCurrentMemberPermission('deleteProject'))
                "
                deleted-item-name="project"
                @delete-handler="removeProject"
              >
                <DeleteButton />
              </DeleteModalForm>
              <DeleteButton v-else disabled />
            </DeleteBanner>
          </CoreColumn>
        </CoreRow>
        <CoreRow>
          <CoreColumn
            v-if="
              currentMember &&
              (hasCurrentMemberPermission('writeProject') ||
                hasCurrentMemberPermission('createAIWeather') ||
                hasCurrentMemberPermission('deleteAIWeather'))
            "
            class="py-0"
          >
            <div v-if="!envAppShowProjectTypeSelection" class="d-flex flex-wrap">
              <CoreCheckbox
                v-if="
                  envSettingsShowWeatherService &&
                  (hasCurrentMemberPermission('createAIWeather') ||
                    hasCurrentMemberPermission('deleteAIWeather'))
                "
                v-model="isWeatherServiceActive"
                :disabled="model === null"
                :label="$t('uiComponents.settings.general.activateWeatherService')"
                class="pr-4"
                hide-details
                @click.capture="handleWeatherService($event)"
              />
              <CoreCheckbox
                v-if="hasCurrentMemberPermission('writeProject')"
                v-model="disableDevicesWhenOffline"
                :false-value="false"
                :label="$t('uiComponents.settings.general.disableDevicesWhenOffline')"
                :true-value="true"
                hide-details
              />
              <CoreCheckbox
                v-if="hasCurrentMemberPermission('writeProject') && dataMappingsEnabled"
                v-model="enableAutomaticReport"
                :false-value="false"
                :label="$t('uiComponents.settings.general.enableAutomaticReport')"
                :true-value="true"
                hide-details
              />
            </div>
            <div class="pt-4">
              <CoreButton button-type="secondary" :disabled="!hasChanged" @click="onProjectChange">
                {{ $t("uiComponents.buttons.cancel") }}
              </CoreButton>
              <CoreButton
                :disabled="!valid || !hasChanged"
                class="ml-5"
                button-type="primary"
                @click="handleGeneralSettings"
              >
                {{ $t("uiComponents.buttons.submit") }}
              </CoreButton>
            </div>
          </CoreColumn>
        </CoreRow>
      </CoreContainer>
    </CoreForm>
  </CoreCard>
</template>

<script lang="ts" setup>
import { debounce } from "lodash";
import { computed, ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";

import api from "@/store/api";
import { IProject } from "@/store/modules/projects/types";
import { RootState } from "@/store/types";
import DeleteButton from "@/ui/components/components/buttons/DeleteButton.vue";
import DeleteBanner from "@/ui/components/components/DeleteBanner.vue";
import DeleteModalForm from "@/ui/components/modals/DeleteModalForm.vue";
import {
  envAppShowProjectTypeSelection,
  envEnableGPSRouter,
  envSettingsShowWeatherService,
  envWorkbenchCategories,
  showHardwareId,
} from "@/utils/env";
import { rules } from "@/utils/validationUtils";

const store = useStore();
const router = useRouter();
const route = useRoute();

const valid = ref(false);
const name = ref("");
const gpsDeviceID = ref("");

const dataMappingsEnabled = envWorkbenchCategories
  .map((item) => item.toLowerCase())
  .includes("datamappings");

/** Store functions used in throughout this componenet */

const currentMember = computed(() => {
  return (store.state as RootState).members.currentMember;
});

const isWeatherServiceActive = computed(() => {
  return (store.state as RootState).mpc.isWeatherServiceActive;
});

const hasCurrentMemberPermission = computed((): ((permission: string) => boolean) => {
  return store.getters["members/hasPermission"];
});

const disableAllFields = computed(() => {
  return !hasCurrentMemberPermission.value("writeProject");
});

const project = computed((): IProject => {
  return (store.state as RootState).projects.project;
});

const updateProject = (project: any): Promise<void> => {
  return store.dispatch("projects/updateProject", project);
};

const postAsset = (asset: any): Promise<any> => {
  return store.dispatch("projects/postProjectAsset", asset);
};

/** Places */

const isFetchingPlaces = ref(false);
const placesArr = ref([null]);

const fetchPlaces = async (place: string) => {
  isFetchingPlaces.value = true;
  placesArr.value = await api.fetch(`/places?q=${place}`, "GET");
  isFetchingPlaces.value = false;
};
const fetchPlacesThrottle = debounce((place: any) => fetchPlaces(place), 1000);

const searchPlaces = ref<string | null>(null);
const onSearchPlaces = async (val: any) => {
  searchPlaces.value = val;
  if (val && val.length > 2) {
    getLocationWithDelay(val);
  }
};

const getLocationWithDelay = async (place: any) => {
  isFetchingPlaces.value = true;
  await fetchPlacesThrottle(place);
};

/** General Project settings */

const hardwareId = ref("");
const description = ref("");
const model = ref<any>(null);
const enableAutomaticReport = ref(false);
const disableDevicesWhenOffline = ref<boolean | undefined>(undefined);

// computed getter & setter, to not overwrite gps_device_id
const cityModel = computed({
  get: () => {
    if (model.value && model.value.display_name) {
      return model.value;
    }
    return null;
  },
  set: (value) => {
    model.value = value;
  },
});

const handleGeneralSettings = async () => {
  const meta = {
    ...project.value.meta,
    location: model.value,
    description: description.value,
    disableDevicesWhenOffline: disableDevicesWhenOffline.value,
    enableAutomaticReport: enableAutomaticReport.value,
  };
  if ((hardwareId.value && showHardwareId) || meta.hardwareId) {
    meta.hardwareId = hardwareId.value;
  }
  if ((gpsDeviceID.value && envEnableGPSRouter) || meta.location.gps_device_id) {
    meta.location = { ...(meta.location ?? {}), gps_device_id: gpsDeviceID.value };
  }
  await updateProject({
    ...project.value,
    ...{ name: name.value },
    meta,
  });
  await store.dispatch("app/fetchWeather", model);
};

onMounted(async () => {
  await onProjectChange();
});

watch(project, async () => {
  await onProjectChange();
});

const hasChanged = computed(() => {
  if (!project.value) return false;
  if (
    name.value != project.value.name ||
    description.value != ((project.value.meta as any).description || "") ||
    model.value != (project.value.meta?.location ?? null) ||
    searchPlaces.value !=
      (project.value.meta?.location && (project.value.meta?.location as any).display_name
        ? (project.value.meta?.location as any).display_name
        : null) ||
    gpsDeviceID.value != (project.value.meta?.location?.gps_device_id ?? null) ||
    disableDevicesWhenOffline.value != project.value.meta?.disableDevicesWhenOffline ||
    enableAutomaticReport.value != (project.value.meta?.enableAutomaticReport ?? true) ||
    hardwareId.value != (project.value.meta?.hardwareId ?? null)
  ) {
    return true;
  }
  return false;
});
const onProjectChange = async () => {
  if (!project.value) return;
  name.value = project.value.name;
  description.value = (project.value.meta as any).description || "";
  model.value = project.value.meta?.location ?? null;
  searchPlaces.value =
    project.value.meta?.location && (project.value.meta?.location as any).display_name
      ? (project.value.meta?.location as any).display_name
      : null;
  gpsDeviceID.value = project.value.meta?.location?.gps_device_id ?? null;
  disableDevicesWhenOffline.value = project.value.meta?.disableDevicesWhenOffline;
  // TODO: Check default
  enableAutomaticReport.value = project.value.meta?.enableAutomaticReport ?? true;
  hardwareId.value = project.value.meta?.hardwareId || "";
  await store.dispatch("mpc/fetchMPCWeatherStatus");
};

const removeProject = async () => {
  await store.dispatch("projects/deleteProject", route.params.id as string);
  await router.push("/");
};

/** Project Image */

const fileObject = ref<File[]>([]);
const handleProjectImageUpload = async () => {
  if (fileObject.value) {
    if (fileObject.value[0].name.lastIndexOf(".") <= 0) {
      return;
    }
    const result = await postAsset(fileObject.value[0]);
    await updateProject({
      ...project.value,
      ...(result && {
        meta: {
          ...project.value.meta,
          imageId: result,
          description: description.value,
        },
      }),
    });
  }
};

/** Report image */

const reportImageObject = ref<File[]>([]);
const handleReportImageUpload = async () => {
  if (reportImageObject.value) {
    if (reportImageObject.value[0].name.lastIndexOf(".") <= 0) {
      return;
    }
    const result = await postAsset(reportImageObject.value[0]);
    await updateProject({
      ...project.value,
      ...(result && {
        meta: { ...project.value.meta, reportImageId: result },
      }),
    });
  }
};

const handleWeatherService = async (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  const latitude = model.value?.lat;
  const longitude = model.value?.lon;
  if (!isWeatherServiceActive.value) {
    await store.dispatch("mpc/activateWeatherService", {
      latitude: +latitude,
      longitude: +longitude,
    });
  } else {
    await store.dispatch("mpc/deactivateWeatherService");
  }
};
</script>

<style lang="scss">
@import "./src/ui/scss/variables";

.general-settings {
  color: rgb(var(--v-theme-LynusText));

  &__delete-banner {
    background: #eca5a5 !important;
    border-left: 2px solid rgb(var(--v-theme-error));

    span {
      color: rgb(var(--v-theme-error));
    }
  }

  .general-settings-title {
    font-size: 20px;
    line-height: 1;
  }

  .general-settings-form {
    .content {
      .upload-file-wrapper {
        .upload-file-field {
          .v-input__prepend-outer {
            display: none !important;
          }
        }
      }

      .upload-description {
        font-size: 10px;
        margin: 5px 0 5px 0;
      }
    }
  }

  .v-autocomplete .v-field:not(.v-field--focused) input {
    min-width: 0;
    height: 0;
  }
}
</style>
