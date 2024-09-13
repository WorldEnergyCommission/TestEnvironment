<template>
  <!-- Foreign object to display tooltip in svg -->
  <foreignObject
    :x="props.position.x"
    :y="props.position.y"
    :width="props.size.width"
    :height="props.size.height"
  >
    <v-tooltip v-model="showTooltip" :text="props.tooltip">
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
    @mouseover="showTooltip = true"
    @mouseleave="showTooltip = false"
  />
</template>
<script lang="ts" setup>
import { ref } from "vue";

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
  tooltip: string;
  svgAttrs?: any;
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
});

const showTooltip = ref(false);
</script>
