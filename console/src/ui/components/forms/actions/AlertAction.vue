<template>
  <CoreRow no-gutters>
    <CoreColumn cols="12">
      <CoreSelect
        v-model="params.type"
        :items="notificationTypes"
        :label="$t('modals.alertAction.notificationType')"
        hide-details
        hide-selected
        item-title="state"
        item-value="abbr"
      />
      <CoreTextField
        v-model="params.body"
        :label="$t('modals.alertAction.body')"
        autocomplete="off"
        style="padding-top: 10px"
      />
    </CoreColumn>
  </CoreRow>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

/**
 * Alert action component.
 * Manages actions.
 */
export default defineComponent({
  props: {
    modelValue: Object as PropType<any>,
  },
  computed: {
    notificationTypes() {
      return [
        { state: this.$t("modals.alertAction.notificationTypes.info"), abbr: 0 },
        { state: this.$t("modals.alertAction.notificationTypes.warning"), abbr: 1 },
        { state: this.$t("modals.alertAction.notificationTypes.error"), abbr: 2 },
      ];
    },
    params: {
      get(): any {
        return this.modelValue ? this.modelValue : { abbr: 0 };
      },
      set(val: any) {
        this.$emit("update:modelValue", val);
      },
    },
  },
  created() {
    if (!this.params.type) {
      this.params.type = 0;
    }
  },
});
</script>
