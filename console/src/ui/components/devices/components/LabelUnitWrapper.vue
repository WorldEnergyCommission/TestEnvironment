<template>
  <div class="label-unit-wrapper">
    <CoreRow
      no-gutters
      :class="[
        'label-unit-wrapper__wrapper',
        { [view]: isDefaultView },
        { disabled: disabled || isControlDisabled },
      ]"
    >
      <CoreColumn
        v-if="isLabel && $slots.label"
        :class="[
          'label',
          { 'label-overflow': labelHideTextThatDoesNotFit },
          { 'mb-2': Object.keys($slots).length > 1 },
          { 'text-center': $vuetify.display.mobile },
        ]"
        :md="Object.keys($slots).length > 1 ? 6 : 12"
        cols="12"
      >
        <slot name="label" />
      </CoreColumn>
      <CoreColumn
        v-if="isValue && $slots.value"
        :class="[
          'value',
          { 'text-center': $vuetify.display.mobile },
          { 'justify-center': $vuetify.display.mobile },
        ]"
        :md="Object.keys($slots).length > 1 ? 6 : 12"
        cols="12"
      >
        <slot name="value" />
      </CoreColumn>
    </CoreRow>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

/**
 * Component is used in many areas of the project to give uniformity to the form fields.
 * Also performs validation if the variable value has not been filled.
 */
export default defineComponent({
  props: {
    isDefaultView: { default: true, type: [Boolean, String] },
    view: { default: "line", type: String },
    disabled: { default: false, type: Boolean },
    variablesListForCheck: Object as PropType<any>,
    labelHideTextThatDoesNotFit: { default: false, type: Boolean },
    isValue: { default: true, type: Boolean },
    isLabel: { default: true, type: Boolean },
  },
  computed: {
    isControlDisabled() {
      if (this.variablesListForCheck)
        return this.variablesListForCheck.some((el: string) => !el?.length);
      else return false;
    },
  },
});
</script>

<style lang="scss" scoped>
.label-unit-wrapper {
  &__wrapper {
    display: flex;
    align-items: center;
  }

  .value {
    display: flex;
  }

  .line {
    .label {
      flex-grow: 1;
    }
  }

  .column {
    flex-direction: column;

    .label,
    .value {
      width: 100%;
    }
  }

  .disabled {
    .label {
      opacity: 0.6;
    }

    .value {
      * {
        opacity: 0.6;
      }

      .v-input {
        opacity: 1;
      }
    }
  }

  .label-overflow {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-right: 5px;
  }
}
</style>
