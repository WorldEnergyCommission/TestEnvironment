<template>
  <v-btn v-bind="getAttributesByButtonType($attrs)" class="swiper-no-swiping">
    <span
      v-if="($slots.icon || $props?.iconName) && props.buttonType !== 'standardIcon'"
      :class="[{ 'mr-2': !$attrs.icon }, 'd-flex']"
    >
      <slot v-if="$slots.icon" name="icon" />
      <lynus-icon
        :size="$props.iconSize ?? 20"
        :color="getAttributesByButtonType($attrs).color"
        :name="$props?.iconName"
      />
    </span>
    <slot />
    <lynus-icon
      v-if="$props?.iconName && props.buttonType === 'standardIcon'"
      :size="$props.iconSize ?? 20"
      :color="getAttributesByButtonType($attrs).color"
      :name="$props?.iconName"
    />
    <span
      v-if="$slots.iconRight && props.buttonType !== 'standardIcon'"
      :class="{ 'ml-2': !$attrs.icon }"
    >
      <slot name="iconRight" />
    </span>
  </v-btn>
</template>

<script lang="ts" setup>
enum ButtonType {
  primary = "primary",
  secondary = "secondary",
  terciary = "terciary",
  delete = "delete",
  icon = "icon",
  standardIcon = "standardIcon",
  deleteIcon = "deleteIcon",
}

type ButtonTypeString = keyof typeof ButtonType;

const props = defineProps<{
  buttonType?: ButtonTypeString;
  transparentBg?: boolean;
  iconName?: string;
  iconSize?: string | number;
}>();

function getAttributesByButtonType(attrs: Record<string, unknown>) {
  const dict: Record<string, Record<string, unknown>> = {
    [ButtonType.primary]: {
      color: "accent",
      variant: "outlined",
      class: !props.transparentBg ? "bg-surface" : "",
    },
    [ButtonType.secondary]: {
      color: "accent",
      variant: "tonal",
    },
    [ButtonType.terciary]: {
      color: "accent",
      variant: "text",
    },
    [ButtonType.delete]: {
      color: "error",
      variant: "tonal",
    },
    [ButtonType.icon]: {
      color: "accent",
      variant: "flat",
      icon: true,
    },
    [ButtonType.deleteIcon]: {
      color: "error",
      variant: "flat",
      icon: true,
    },
    [ButtonType.standardIcon]: {
      icon: true,
      color: null,
    },
  };
  const buttonTypeStyle = props.buttonType ? dict[props.buttonType] : {};

  return {
    elevation: "0",
    color: "lynusText",
    ...buttonTypeStyle,
    ...attrs,
  };
}
</script>

<style lang="scss">
.not-mobile .v-btn__content {
  height: 50% !important;
}

.lynus-small-btn-double-border {
  border-width: 2px !important;
}

.label-unit-wrapper .disabled .value .v-btn {
  opacity: 1;
}
</style>
