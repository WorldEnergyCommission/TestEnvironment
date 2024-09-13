<template>
  <div>
    <CoreRow>
      <CoreColumn cols="6">
        <CoreButton
          v-if="showBackButton"
          class="ml-auto"
          button-type="secondary"
          @click="$emit('back')"
        >
          <template #icon>
            <CoreIcon color="theme" size="small"> fas fa-chevron-left </CoreIcon>
          </template>
          {{ $t("uiComponents.buttons.previous") }}
        </CoreButton>
      </CoreColumn>
      <CoreColumn cols="6">
        <CoreTooltip :disabled="hideNextToolTip" location="top">
          <template #activator="{ props }">
            <div style="display: inline-block; float: right" v-bind="props">
              <CoreButton
                :disabled="disableNextButton"
                button-type="primary"
                @click="$emit('next', $event)"
              >
                {{ $t("uiComponents.buttons.next") }}
                <template #iconRight>
                  <CoreIcon size="small"> fas fa-chevron-right </CoreIcon>
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
    disableNextButton: { default: false, type: Boolean },
    showBackButton: { default: false, type: Boolean },
    nextButtonToolTip: { default: "", type: String },
  },
  emits: ["back", "next"],
});
</script>

<style scoped>
.actions {
  display: flex;
  align-items: center;
}
</style>
