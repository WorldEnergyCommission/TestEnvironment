<template>
  <CoreCard class="w-100 h-100" variant="tonal" style="overflow: visible">
    <CoreCardItem>
      <CoreContainer>
        <CoreCardTitle
          :title="`${text_long} ${unit}`"
          class="pb-0 d-flex justify-space-between"
          style="overflow: visible"
        >
          <div>
            <span class="text-h5"> {{ text }} </span>
            <span class="font-weight-light text-body-1"> {{ unit }} </span>
          </div>
          <div><slot /></div>
        </CoreCardTitle>
        <CoreCardSubtitle :title="title">
          {{ title }}
        </CoreCardSubtitle>

        <CoreSheet
          style="
            width: 50px;
            height: 50px;
            left: -25px;
            top: 10px;
            position: absolute;
            box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
            border-radius: 9999px;
            z-index: 1;
          "
          class="d-flex align-center justify-center"
          variant="elevated"
        >
          <lynus-icon :color="iconColor ? iconColor : 'accent'" :name="icon" />
        </CoreSheet>
      </CoreContainer>
    </CoreCardItem>
  </CoreCard>
</template>
<script lang="ts" setup>
import anime from "animejs/lib/anime.es.js";
import { computed, reactive, onMounted } from "vue";

const props = withDefaults(
  defineProps<{
    icon?: string;
    title?: string;
    number?: number;
    iconColor?: string;
    unit?: string;
    animate?: boolean;
  }>(),
  { animate: true },
);

const tweened = reactive({
  number: 0,
});

const text = computed(() => {
  return Intl.NumberFormat("de-GE", { maximumFractionDigits: 1 }).format(
    Number(props.animate ? tweened.number : props.number),
  );
});
const text_long = computed(() => {
  return Intl.NumberFormat("de-GE", { maximumFractionDigits: 3 }).format(
    Number(props.animate ? tweened.number : props.number),
  );
});
function setCount(val: number) {
  const obj = { n: tweened.number };
  if (props.animate) {
    anime({
      targets: obj,
      n: val,
      duration: 3000,
      easing: "linear",
      update: () => {
        tweened.number = obj.n;
      },
    });
  } else {
    tweened.number = val;
  }
}
onMounted(() => setCount(Math.abs(props.number)));
</script>
