<template>
  <VueDatePicker
    v-bind="$attrs"
    :format="$attrs['time-picker'] !== undefined ? hourLocale : 'dd.MM.yyyy'"
    :locale="locale"
  >
    <template v-if="$slots.trigger" #trigger>
      <slot name="trigger"> </slot>
    </template>
  </VueDatePicker>
</template>
<script lang="ts">
export default defineComponent({
  name: "CoreDatePicker",
});
</script>
<script lang="ts" setup>
import VueDatePicker from "@vuepic/vue-datepicker";
import { defineComponent, computed } from "vue";
import { useI18n } from "vue-i18n";
import "@vuepic/vue-datepicker/dist/main.css";

const { locale } = useI18n();

const hourLocale = computed(() => (locale.value !== "en" ? "HH:mm" : "hh:mm"));
</script>
<style lang="scss"></style>
