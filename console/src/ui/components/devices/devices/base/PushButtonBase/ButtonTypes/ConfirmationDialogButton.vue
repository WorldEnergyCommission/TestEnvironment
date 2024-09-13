<template>
  <div>
    <CoreButton
      :color="!$vuetify.theme.current.dark ? '#215B28' : '#424242'"
      :disabled="currentState"
      :height="buttonHeight"
      :width="buttonWidth"
      @click="dialogActive = true"
    >
      <span class="d-flex flex-column">
        <lynus-icon
          :color="!currentState ? iconColor : 'theme'"
          :name="'push_button'"
          :size="iconSize"
        />
        <slot name="buttonText" />
      </span>
    </CoreButton>

    <CoreDialog v-model="dialogActive" width="300">
      <CoreCard color="#e6f5e8">
        <div class="py-2 d-flex justify-center">
          {{ $t("uiComponents.confirmationDialog.title") }}
        </div>
        <div class="pa-4 d-flex justify-space-between">
          <CoreButton button-type="terciary" color="green" width="60" @mousedown="handleEvent">
            {{ $t("uiComponents.confirmationDialog.yes") }}
          </CoreButton>
          <CoreButton button-type="terciary" color="error" width="60" @click="dialogActive = false">
            {{ $t("uiComponents.confirmationDialog.no") }}
          </CoreButton>
        </div>
      </CoreCard>
    </CoreDialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

/**
 * Component that represent ConfirmationDialogButton type for PushButton base control
 */
export default defineComponent({
  props: {
    currentState: { default: null, type: Object as PropType<number | null> },
    buttonWidth: { default: 150, type: Number },
    buttonHeight: { default: 36, type: Number },
    iconColor: { default: "theme", type: String },
    iconSize: { default: null, type: [Number, String] },
  },
  data() {
    return {
      dialogActive: false,
    };
  },
  methods: {
    handleEvent() {
      this.$emit("sendConfirmed");
      this.dialogActive = false;
    },
  },
});
</script>

<style lang="scss" scoped></style>
