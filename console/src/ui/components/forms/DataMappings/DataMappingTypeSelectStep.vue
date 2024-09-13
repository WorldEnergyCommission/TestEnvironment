<template>
  <div>
    <CoreRow>
      <CoreSelect
        v-model="modelValue"
        :items="items"
        density="compact"
        :loading="loadingTypes"
        hide-details
        item-title="name"
        item-value="id"
        return-object
      />
    </CoreRow>

    <CoreRow class="flex-column-reverse align-end pt-3">
      <CoreTooltip :disabled="!typeValidation" location="top">
        <template #activator="{ props }">
          <div v-bind="props">
            <CoreButton
              :disabled="typeValidation"
              button-type="primary"
              @click="$emit('selected', modelValue)"
            >
              {{ $t("uiComponents.buttons.next") }}
              <template #iconRight>
                <CoreIcon size="small"> fas fa-chevron-right </CoreIcon>
              </template>
            </CoreButton>
          </div>
        </template>
        <span>{{ $t("modals.manageDevice.tooltips.type") }}</span>
      </CoreTooltip>
    </CoreRow>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, defineEmits, defineModel, onMounted } from "vue";
import { useStore } from "vuex";

import api from "@/store/api";
import { DataMappingType } from "@/store/modules/dataMappings/types";

const store = useStore();
const items = ref([]);
const loadingTypes = ref(false);

const modelValue = defineModel<DataMappingType>();

const emit = defineEmits(["selected"]);

const typeValidation = computed(() => {
  return modelValue.value === null || modelValue.value?.id === "";
});
const fetchTypes = async () => {
  try {
    loadingTypes.value = true;
    const response = await api.fetch("/data-mapping/types/list", "GET");
    items.value = response;
  } catch (e: any) {
    store.commit("app/setReport", {
      type: "error",
      message: e?.message,
      value: true,
    });
  } finally {
    loadingTypes.value = false;
  }
};

onMounted(() => fetchTypes());
</script>
