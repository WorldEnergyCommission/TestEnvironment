<template>
  <svg :style="`width: ${props.width}px; height: ${props.heigth}px;`">
    <defs>
      <mask :id="`mask-gradient-svg-${uid}`">
        <g stroke="white"><slot /></g>
      </mask>
    </defs>
    <foreignObject
      width="100%"
      height="100%"
      x="0"
      y="0"
      :style="`mask: url(#mask-gradient-svg-${uid});`"
    >
      <div
        :style="`height: ${props.heigth}px; width: ${props.width}px; `"
        className="gradient shimmer gradiented-overlay"
      />
    </foreignObject>
  </svg>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
import { ref, onMounted, onUnmounted, reactive } from "vue";

const uid = ref(null);

onMounted(() => {
  uid.value = uuidv4();
});

const props = defineProps({
  startColor: {
    type: String,
    default: "green",
  },
  endColor: {
    type: String,
    default: "red",
  },
  width: {
    type: Number,
    default: 1920,
  },
  heigth: {
    type: Number,
    default: 3072,
  },
});
</script>

<style lang="scss" scoped>
/* The relevant stuff */
@keyframes shimmer {
  from {
    background-position: 0% 0%;
  }
  to {
    background-position: 0% 100%;
  }
}

$randomNumber: random(1500);

.shimmer {
  animation: shimmer 1500ms linear infinite alternate;
  animation-delay: $randomNumber + ms;
}

.gradient {
  background: linear-gradient(to bottom, v-bind(startColor), v-bind(endColor));
  background-size: 200% 200%;
  background-position: 0 0;
}

.gradiented-overlay {
  background-attachment: initial;
}
</style>
