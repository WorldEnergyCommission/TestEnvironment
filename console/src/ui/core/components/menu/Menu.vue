<template>
  <v-menu v-bind="$attrs" v-model="modelValue">
    <template #activator="{ props }">
      <slot name="activator" :props="props" />
    </template>
    <slot />
  </v-menu>
</template>

<script lang="ts" setup>
import { useSwiper } from "swiper/vue";
import { inject, watch } from "vue";

const modelValue = defineModel<boolean>();

function useSwiperUnsafe() {
  const injected = inject("swiper", null);
  if (injected) {
    return useSwiper();
  }
  return null;
}

const swiper = useSwiperUnsafe();

watch(modelValue, (newVal) => {
  if (newVal) {
    disableSwiper();
  } else {
    enableSwiper();
  }
});

function disableSwiper() {
  swiper && swiper.value && swiper.value.disable();
}

function enableSwiper() {
  swiper && swiper.value && swiper.value.enable();
}
</script>

<style lang="scss" scoped></style>
