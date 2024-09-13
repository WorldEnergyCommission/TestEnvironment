<template>
  <CoreCombobox
    v-model="localValue"
    :color="color"
    :items="timezones"
    :label="$t('uiComponents.timezoneChooser.labelText')"
    :rules="[rules.required]"
    @update:model-value="onChange"
  />
</template>

<script lang="ts">
import { clone } from "lodash";
import { tz } from "moment-timezone";
import { defineComponent } from "vue";

import { Validation } from "@/ui/mixins/validation";

/**
 * Component that represent TimezoneChooser
 */
export default defineComponent({
  mixins: [Validation],
  props: {
    currentValue: {
      type: String,
    },
    color: { default: "blue", type: String },
    disabled: { default: false, type: Boolean },
  },
  emits: ["onChange"],
  data() {
    const localValue = undefined as string | undefined;

    return {
      localValue,
      timezones: tz.names(),
    };
  },
  created() {
    this.localValue = clone(this.currentValue);
  },
  methods: {
    onChange() {
      this.$emit("onChange", this.localValue);
    },
  },
});
</script>

<style></style>
