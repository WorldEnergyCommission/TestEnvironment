<template>
  <div>
    <CoreRow>
      <CoreSelect
        v-model="type"
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
      <CoreTooltip :disabled="typeValidation" location="top">
        <template #activator="{ props }">
          <div v-bind="props">
            <CoreButton
              :disabled="typeValidation"
              button-type="primary"
              @click="$emit('selected', type)"
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
<script lang="ts">
import { defineComponent, PropType } from "vue";

import api from "@/store/api";
import { ModuleType } from "@/store/modules/modules/types";

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<ModuleType>,
    },
  },
  data() {
    return {
      items: [],
      loadingTypes: false,
    };
  },
  computed: {
    type: {
      get() {
        return this.modelValue;
      },
      set(item: any) {
        this.$emit("update:modelValue", item);
      },
    },
    typeValidation() {
      return this.type === null || this.type?.id === "";
    },
  },
  created() {
    this.fetchTypes();
  },
  methods: {
    async fetchTypes() {
      try {
        this.loadingTypes = true;
        const response = await api.fetch("/modules/types/list", "GET");
        this.items = response;
      } catch (e: any) {
        this.setReport({
          type: "error",
          message: e?.message,
          value: true,
        });
      } finally {
        this.loadingTypes = false;
      }
    },
    setReport(payload: any) {
      this.$store.commit("app/setReport", payload);
    },
  },
});
</script>
