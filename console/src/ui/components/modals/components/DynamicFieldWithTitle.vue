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
        <div style="width: 80%">
          <ComboboxField
            v-model="targetObject[key].variable"
            :items="itemsList"
            :label="$t('uiComponents.form.variable')"
            :optional="isOptional"
            :rules="[rules.required]"
          />
          <CoreTextField
            v-model="targetObject[key].title"
            :label="$t('uiComponents.form.title')"
            class="pt-1"
            hide-details
          />
        </div>
        <div class="d-flex justify-center" style="width: 20%">
          <CoreButton
            v-if="!index"
            :disabled="Object.keys(targetObject).length >= maxNumberOfFields"
            class="ml-3"
            button-type="icon"
            @click="addMaxPowerItem"
          >
            <lynus-icon :size="20" color="white" name="plus" />
          </CoreButton>
          <CoreButton
            v-else
            class="ml-3"
            button-type="deleteIcon"
            @click="() => deleteMaxPowerItem(key)"
          >
            <lynus-icon :size="20" color="white" name="x" />
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
    isOptional: { default: false, type: [Boolean, Object] },
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
      this.targetObject[`mp-${Date.now()}`] = { variable: "", title: "" };
    },
    deleteMaxPowerItem(key: string) {
      delete this.targetObject[key];
    },
  },
});
</script>

<style lang="scss" scoped></style>
