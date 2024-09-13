<template>
  <CoreStepperHeader>
    <CoreStepperItem :complete="stage > 1" :value="1">
      <span v-if="!$vuetify.display.mobile">
        {{ $t(`modals.${translationSubPath}.stepperHeader.stage1`) }}
      </span>
    </CoreStepperItem>
    <CoreDivider />
    <CoreStepperItem :complete="stage > 2" :value="2">
      <span v-if="!$vuetify.display.mobile">
        {{ $t(`modals.${translationSubPath}.stepperHeader.stage2`) }}
      </span>
    </CoreStepperItem>
    <CoreDivider />
    <CoreStepperItem :value="3">
      <span v-if="!$vuetify.display.mobile">
        {{ $t(`modals.${translationSubPath}.stepperHeader.stage3`) }}
      </span>
    </CoreStepperItem>
  </CoreStepperHeader>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    stage: { default: 1, type: Number },
    translationSubPath: { default: "manageDevice", type: String },
  },
});
</script>
