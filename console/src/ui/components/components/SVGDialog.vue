<template>
  <!-- Foreign object to display tooltip in svg -->
  <foreignObject
    :x="props.position.x"
    :y="props.position.y"
    :width="props.size.width"
    :height="props.size.height"
  >
    <EfficientIODialog v-model="showDialog" :dialog-title="props.dialogTitle">
      <!-- dummy div to to correctly place tooltip in svg-->
      <template #activator="{ props }">
        <div v-bind="props" />
        <slot name="activator" />
      </template>
      <template #content>
        <slot name="content" />
      </template>
    </EfficientIODialog>
    <v-tooltip v-if="hasTooltip" v-model="showTooltip" :text="props.tooltip">
      <!-- dummy div to to correctly place tooltip in svg-->
      <template #activator="{ props }">
        <div v-bind="props" />
      </template>
    </v-tooltip>
  </foreignObject>
  <rect
    :x="props.position.x - 15"
    :y="props.position.y - 15"
    opacity="1"
    fill-opacity="0"
    :width="props.size.width + 30"
    :height="props.size.height + 30"
    :stroke="showTooltip ? 'rgb(var(--v-theme-accent))' : ''"
    stroke-width="5"
  />
  <rect
    :x="props.position.x"
    :y="props.position.y"
    opacity="1"
    fill-opacity="0"
    :width="props.size.width"
    :height="props.size.height"
    v-bind="svgAttrs"
    @click="showDialog = true"
    @mouseover="showTooltip = true"
    @mouseleave="showTooltip = false"
  />
</template>
<script lang="ts" setup>
import { computed, ref } from "vue";

import EfficientIODialog from "@/ui/components/modals/EfficientIODialog.vue";

// Properties
interface Props {
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  svgAttrs?: any;
  tooltip: string;
  dialogTitle: string;
}

const props = withDefaults(defineProps<Props>(), {
  position: () => ({
    x: 0,
    y: 0,
  }),
  size: () => ({
    width: 0,
    height: 0,
  }),
  tolltip: "",
  dialogTitle: "",
});

const showDialog = ref(false);
const showTooltip = ref(false);

const hasTooltip = computed(() => props.tooltip && props.tooltip != "");
</script>
