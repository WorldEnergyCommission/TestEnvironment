<template>
  <CoreCard class="general-settings">
    <CoreRow>
      <CoreColumn class="general-settings-title pb-0" cols="12">
        {{ $t("uiComponents.settings.electricity_price.grid") }}
      </CoreColumn>
      <CoreColumn class="pt-0">
        <CoreForm :disabled="disableAllFields">
          <CoreContainer class="px-0 content" fluid>
            <CoreRow>
              <CoreColumn cols="12" md="6" order-md="3">
                <CoreTextField
                  v-model="consumption_price"
                  :label="$t('uiComponents.settings.electricity_price.consumption')"
                  hide-details="auto"
                  max-length="50"
                  density="comfortable"
                  prefix="€"
                  type="number"
                />
              </CoreColumn>
              <CoreColumn cols="12" md="6" order-md="6">
                <CoreTextField
                  v-model="feed_in_price"
                  :label="$t('uiComponents.settings.electricity_price.feed_in')"
                  hide-details="auto"
                  max-length="30"
                  density="comfortable"
                  prefix="€"
                  type="number"
                />
              </CoreColumn>
            </CoreRow>
          </CoreContainer>
        </CoreForm>
      </CoreColumn>
    </CoreRow>
    <CoreRow>
      <CoreColumn class="general-settings-title pb-0 pt-0" cols="12">
        {{ $t("uiComponents.settings.electricity_price.charging") }}
      </CoreColumn>
      <CoreColumn class="pt-0">
        <CoreForm :disabled="disableAllFields">
          <CoreContainer class="px-0 content" fluid>
            <CoreRow>
              <CoreColumn cols="12" md="6" order-md="3">
                <CoreTextField
                  v-model="charging_price"
                  :label="$t('uiComponents.settings.electricity_price.chargin_price')"
                  hide-details="auto"
                  max-length="50"
                  density="comfortable"
                  prefix="€"
                  type="number"
                />
              </CoreColumn>

              <CoreColumn cols="12" md="6" order-md="6">
                <CoreButton
                  button-type="secondary"
                  :disabled="!hasUserChangedInput"
                  @click="onProjectChange"
                >
                  {{ $t("uiComponents.buttons.cancel") }}
                </CoreButton>
                <CoreButton
                  class="ml-5"
                  button-type="primary"
                  :disabled="!hasUserChangedInput"
                  @click="saveNewPrice"
                >
                  {{ $t("uiComponents.buttons.submit") }}
                </CoreButton>
              </CoreColumn>
            </CoreRow>
          </CoreContainer>
        </CoreForm>
      </CoreColumn>
    </CoreRow>
  </CoreCard>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, watch } from "vue";
import { useStore } from "vuex";

import { IProject } from "@/store/modules/projects/types";
import { RootState } from "@/store/types";

const store = useStore();

/** Store functions used in throughout this componenet */
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

/** General Project settings */

const consumption_price = ref(0);
const feed_in_price = ref(0);
const charging_price = ref(0);

const saveNewPrice = async () => {
  const meta = {
    ...project.value.meta,
    electricity_price: {
      consumption: consumption_price.value,
      feed_in: feed_in_price.value,
      charging_price: charging_price.value,
    },
  };
  await updateProject({
    ...project.value,
    meta,
  });
};

onMounted(async () => {
  await onProjectChange();
});

watch(project, async () => {
  await onProjectChange();
});

const hasUserChangedInput = computed(() => {
  if (!project.value) {
    return false;
  }
  if (
    consumption_price.value != (project.value.meta.electricity_price?.consumption ?? 0) ||
    feed_in_price.value != (project.value.meta.electricity_price?.feed_in ?? 0) ||
    charging_price.value != (project.value.meta.electricity_price?.charging_price ?? 0)
  ) {
    return true;
  }
  return false;
});
const onProjectChange = async () => {
  if (!project.value) return;
  consumption_price.value = project.value.meta.electricity_price?.consumption ?? 0;
  feed_in_price.value = project.value.meta.electricity_price?.feed_in ?? 0;
  charging_price.value = project.value.meta.electricity_price?.charging_price ?? 0;
};
</script>

<style lang="scss">
@import "./src/ui/scss/variables";
</style>
