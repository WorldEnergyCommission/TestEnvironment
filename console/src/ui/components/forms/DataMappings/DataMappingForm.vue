<template>
  <div v-if="!loadingProps">
    <CoreRow dense>
      <CoreColumn cols="12">
        <CoreTextField
          v-model="name"
          :label="$t('modals.manageDevice.form.name')"
          hide-details
          max-length="30"
        />
      </CoreColumn>
      <CoreColumn cols="12">
        <b> Mappings </b>
      </CoreColumn>
      <CoreColumn v-for="(item, index) in properties" :key="index" cols="12">
        <div>
          <CoreChip class="mb-3">
            {{ item.name }}
          </CoreChip>
          <ComboboxField
            v-model="mappings[item.id]"
            :items="measurementsKeysList"
            :optional="item.optional"
            :required="item.group === 'View'"
            hide-details
          />
          <div class="description">
            <i> {{ item.group }} </i>
            {{ item.group === "View" ? `-` : "" }}
            <b>
              {{ item.group === "View" ? $t("validationRules.required") : "" }}
            </b>
          </div>
        </div>
      </CoreColumn>
    </CoreRow>
    <CoreRow>
      <CoreColumn>
        <FinalStepActions
          :disable-next-button="!typeValidation"
          :next-button-tool-tip="$t('modals.manageDevice.tooltips.requiredFields')"
          :hide-next-tool-tip="typeValidation"
          :with-spacer="true"
          style="width: 100%"
          :loading="loadingCreate"
          :with-back="!editExistingDataMapping"
          @back="$emit('back')"
          @next="addDataMapping"
        />
      </CoreColumn>
    </CoreRow>
  </div>
  <CircleSpinner v-else />
</template>
<script lang="ts" setup>
import { computed, ref, withDefaults, defineEmits, watch, onMounted } from "vue";
import { useStore } from "vuex";

import api from "@/store/api";
import { DataMappingType } from "@/store/modules/dataMappings/types";
import { RootState } from "@/store/types";
import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import { FinalStepActions } from "@/ui/components/modals/components/Actions";
import ComboboxField from "@/ui/components/modals/components/form/ComboboxField.vue";

const props = withDefaults(
  defineProps<{
    type?: DataMappingType;
    editExistingDataMapping?: boolean;
    currentID?: string;
    currentName?: string;
    currentMappings?: Record<string, string> | undefined;
  }>(),
  {
    type: {},
    editExistingDataMapping: false,
  },
);

const mappings = ref<Record<string, string>>({});
const properties = ref<
  { group: string; id: string; name: string; optional: string; unit: string }[]
>([]);
const name = ref("");

const store = useStore();
const projectId = computed(() => {
  return (store.state as RootState).projects.projectId;
});
const measurementsKeysList = computed(() => {
  return (store.state as RootState).measurements.measurementsKeys;
});

const loadingProps = ref(false);
const fetchMappingProperties = async () => {
  if (!props.type.id || props.type.id === "") return;
  try {
    loadingProps.value = true;
    const response = await api.fetch(`/data-mapping/types/${props.type.id}/properties`, "GET");
    properties.value = response;
  } catch (e: any) {
    store.commit("app/setReport", {
      type: "error",
      message: e?.message,
      value: true,
    });
  } finally {
    loadingProps.value = false;
  }
};
watch(props.type, fetchMappingProperties);

const typeValidation = computed(() => {
  return (
    properties.value.every((prop) => {
      if (prop.group != "View") {
        return true;
      }
      return mappings.value[prop.id] && mappings.value[prop.id] != "";
    }) && name.value != ""
  );
});

const loadingCreate = ref(false);
const emit = defineEmits(["finished", "back"]);
async function addDataMapping() {
  try {
    loadingCreate.value = true;
    const filteredMappings = Object.fromEntries(
      Object.entries(mappings.value).filter(([key, value]) => value != ""),
    );
    const body = {
      type_id: props.type.id,
      name: name.value,
      mappings: filteredMappings,
    };
    const method = props.editExistingDataMapping ? "PUT" : "POST";
    const url = props.editExistingDataMapping
      ? `/projects/${projectId.value}/data-mapping/${props.currentID}`
      : `/projects/${projectId.value}/data-mapping`;
    const response = await api.fetch(url, method, body);
    emit("finished", response.data);
  } catch (e: any) {
    store.commit("app/setReport", {
      type: "error",
      message: e?.message,
      value: true,
    });
  } finally {
    loadingCreate.value = false;
  }
}

onMounted(() => {
  store.dispatch("measurements/fetchMeasurements", projectId.value);
  if (props.currentName) {
    name.value = props.currentName;
  }
  if (props.currentMappings) {
    mappings.value = props.currentMappings;
  }

  fetchMappingProperties();
});
</script>
