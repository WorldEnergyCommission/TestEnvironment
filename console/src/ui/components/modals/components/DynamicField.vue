<template>
  <div class="dynamic-field">
    <div class="dynamic-field__label">
      {{ label }}
    </div>
    <div class="dynamic-field__items">
      <div
        v-for="(value, key, index) in targetObject"
        :key="index"
        class="d-flex align-center pb-2"
      >
        <div style="width: 60%">
          <ComboboxField
            v-model="targetObject[key]"
            :items="itemsList"
            :label="instanceLabelPath ? $t(instanceLabelPath, { count: index + 1 }) : 'Label'"
            :optional="isOptional"
            :rules="[rules.required]"
          />
        </div>
        <div class="d-flex justify-center" style="width: 40%">
          <CoreButton
            v-if="!index"
            :disabled="Object.keys(targetObject).length >= maxNumberOfFields"
            class="ml-2"
            button-type="primary"
            @click="addMaxPowerItem"
          >
            <template #icon>
              <lynus-icon :size="20" color="accent" name="plus" />
            </template>
            add
          </CoreButton>
          <CoreButton
            v-else
            class="ml-1 mt-1"
            button-type="deleteIcon"
            @click="() => deleteMaxPowerItem(key)"
          >
            <lynus-icon color="white" name="x" />
          </CoreButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import ComboboxField from "@/ui/components/modals/components/form/ComboboxField.vue";
import { Validation } from "@/ui/mixins/validation";

/**
 * Dynamic field component which used in manage modal forms.
 * Creates new fields for targetObject prop
 */
export default defineComponent({
  components: {
    ComboboxField,
  },
  mixins: [Validation],

  props: {
    isOptional: { default: false, type: Boolean },
    modelValue: Object as PropType<any>,
    label: String,
    itemsList: Object as PropType<any>,
    maxNumberOfFields: { required: true, type: Number },
    /** used vue-i18n "$t" function, example: $t(path_to_lang_file)*/
    instanceLabelPath: { default: null, type: String },
  },
  computed: {
    targetObject: {
      get(): any {
        return this.modelValue;
      },
      set(val: any) {
        this.$emit("update:modelValue", val);
      },
    },
  },
  methods: {
    addMaxPowerItem() {
      this.targetObject[`mp-${Date.now()}`] = "";
    },
    deleteMaxPowerItem(key: string) {
      delete this.targetObject[key];
    },
  },
});
</script>

<style lang="scss" scoped></style>
