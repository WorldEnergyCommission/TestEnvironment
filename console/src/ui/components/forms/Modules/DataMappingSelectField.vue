<template>
  <CoreAutocomplete
    ref="customField"
    v-model="value"
    :disabled="disabled || items.length === 0"
    :items="items"
    item-title="device_name"
    item-value="device_id"
    :label="label"
    :rules="[customRules]"
    class="custom-combobox-field"
    chips
    closable-chips
    :multiple="maxCount > 1"
    clearable
    hide-details="auto"
    hide-selected
    return-object
  >
    <template #chip="{ props, item }">
      <CoreChip
        v-bind="props"
        closable
        variant="outlined"
        :text="item?.raw?.data_mapping_name"
        color="accent"
        class="pa-3"
      />
    </template>
    <template #item="{ props, item }">
      <CoreListItem v-bind="props">
        <CoreListItemSubtitle>{{ item?.raw?.data_mapping_type_name }}</CoreListItemSubtitle>
        <CoreListItemSubtitle>{{ item?.raw?.data_mapping_id }}</CoreListItemSubtitle>
      </CoreListItem>
    </template>
  </CoreAutocomplete>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { DataMapping } from "@/store/modules/dataMappings/types";
import { ModuleProperty } from "@/store/modules/modules/types";

/**
 * Combobox field component which used in manage modal forms
 */
export default defineComponent({
  setup() {
    const customField = ref(null);
    return {
      customField,
    };
  },
  data() {
    return {
      rawItem: [] as {
        name: string;
        id: string;
        typeId: string;
      }[],
    };
  },
  computed: {
    customRules() {
      if (!this.optional)
        return (value: number) => value === 0 || !!value || this.$t("validationRules.required");
      else return true;
    },
    items() {
      return this.$store.getters["dataMappings/filteredByType"](this.typeId).map(
        (data_mapping: DataMapping) => {
          (data_mapping as any).device_id = data_mapping.id;
          return {
            data_mapping_id: data_mapping.id,
            data_mapping_type_name: data_mapping.type,
            data_mapping_name: data_mapping.name,
          };
        },
      );
    },
    value: {
      get() {
        if (Array.isArray(this.modelValue)) {
          return this.modelValue.map((item) => ({
            device_id: item.device_id,
            name: item.name,
            device_name: item.device_name,
          }));
        }
        return this.modelValue;
      },
      set(event: ModuleProperty | ModuleProperty[]) {
        if (Array.isArray(event)) {
          const val = event.map((item) => ({
            data_mapping_id: item.data_mapping_id,
            type: this.typeId,
            data_mapping_name: item.data_mapping_name,
          }));
          this.$emit("update:model-value", val);
          return;
        }
        this.$emit("update:model-value", {
          data_mapping_id: event.data_mapping_id,
          data_mapping_name: event.data_mapping_name,
          type: this.typeId,
        });
      },
    },
  },
  mounted() {
    ((this.customField as any).coreAutocomplete as any).validate(true);
  },
  props: {
    modelValue: [Object, Array<ModuleProperty>],
    typeId: String,
    label: { default: null, type: String },
    optional: { default: true, type: Boolean },
    maxCount: { default: 1, type: Number },
    disabled: Boolean,
  },
});
</script>

<style lang="scss">
.custom-combobox-field {
  .v-input__control {
    .v-input__slot {
      margin: 0 !important;
    }

    .v-text-field__details {
      margin: 0 !important;
      padding: 0 !important;
    }
  }
}
</style>
