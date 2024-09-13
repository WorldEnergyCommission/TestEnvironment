<template>
  <div class="actions">
    <CoreRow>
      <CoreColumn cols="6">
        <CoreButton v-if="withBack" class="ml-auto" button-type="secondary" @click="$emit('back')">
          <template #icon>
            <CoreIcon color="theme" size="small"> fas fa-chevron-left </CoreIcon>
          </template>
          {{ $t("uiComponents.buttons.previous") }}
        </CoreButton>
      </CoreColumn>
      <CoreSpacer v-if="withSpacer" />
      <CoreColumn cols="6">
        <CoreTooltip :disabled="hideNextToolTip" location="top">
          <template #activator="{ props }">
            <div style="display: inline-block; float: right" v-bind="props">
              <CoreButton
                :disabled="disableNextButton"
                :loading="loading"
                class="ml-3"
                button-type="primary"
                @click="$emit('next', $event)"
              >
                {{ $t("uiComponents.buttons.send") }}
                <template #iconRight>
                  <CoreIcon v-if="!loading" size="15"> far fa-paper-plane </CoreIcon>
                </template>
              </CoreButton>
            </div>
          </template>
          <span>{{ nextButtonToolTip }}</span>
        </CoreTooltip>
      </CoreColumn>
    </CoreRow>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    hideNextToolTip: { default: false, type: Boolean },
    withSpacer: { default: false, type: Boolean },
    disableNextButton: { default: false, type: Boolean },
    nextButtonToolTip: { default: "", type: String },
    loading: { default: false, type: Boolean },
    withBack: { default: true, type: Boolean },
    modelValue: {
      type: Boolean,
    },
  },
  emits: ["back", "next", "input", "update:modelValue"],
  computed: {
    optionalFields: {
      get() {
        return this.modelValue;
      },
      set(val: boolean) {
        this.$emit("update:modelValue", val);
      },
    },
  },
});
</script>
<style scoped></style>
