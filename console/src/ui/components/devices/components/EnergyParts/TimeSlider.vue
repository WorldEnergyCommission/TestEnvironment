<template>
  <div
    :class="[
      'time-slider',
      { 'd-flex': $vuetify.display.mobile },
      { 'flex-column': $vuetify.display.mobile },
    ]"
  >
    <div :class="['label', { 'align-self-center': $vuetify.display.mobile }]">
      {{
        $vuetify.display.mobile
          ? `${groupSliderStartLabel} - ${groupSliderEndLabel}`
          : groupSliderStartLabel
      }}
    </div>
    <div class="time-slider-value">
      <CoreSlider
        :max="sliderMaxLength"
        :min="0"
        :step="1"
        :model-value="modelValue"
        hide-details
        :thumb-label="$vuetify.display.mobile ? true : 'always'"
        @update:model-value="$emit('update:modelValue', $event)"
        @touchmove.stop="disableSwiper"
        @touchend.stop="enableSwiper"
        @mousemove.prevent="disableSwiper"
        @mouseup.prevent="enableSwiper"
      >
        <template #thumb-label>
          <div class="d-flex flex-column align-center" style="font-size: 10px">
            <div>{{ groupSliderThumbLabelValue.start }}</div>
            <div
              v-show="groupSliderThumbLabelValue.end"
              style="height: 1px; width: 10px; background: #fff"
            />
            <div>{{ groupSliderThumbLabelValue.end }}</div>
          </div>
        </template>
      </CoreSlider>
    </div>
    <div v-if="!$vuetify.display.mobile" class="label">
      {{ groupSliderEndLabel }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSwiper } from "swiper/vue";
import { defineModel, computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify";

//TODO put in core slider
function useSwiperUnsafe() {
  const injected = inject("swiper", null);
  if (injected) {
    return useSwiper();
  }
  return null;
}

const swiper = useSwiperUnsafe();

function disableSwiper() {
  swiper && swiper.value && swiper.value.disable();
}
function enableSwiper() {
  swiper && swiper.value && swiper.value.disable();
}

const modelValue = defineModel<number>();
const props = defineProps<{
  items: any[];
}>();

const { mobile } = useDisplay();

const { d, t, locale } = useI18n();
const langSettingSting = computed(() => {
  let langString = "en-GB";
  if (locale.value === "de") {
    langString = "de-GE";
  } else if (locale.value === "it") {
    langString = "it-IT";
  }
  return langString;
});
const localTimeOptions = computed(() => {
  const options: any = {
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  if (mobile.value) {
    options.month = "short";
  }
  return options;
});
const groupSliderStartLabel = computed(() => {
  if (!props.items.length) return "no data";
  const d: Date = new Date(props.items[0][0] * 1000);
  return d ? d.toLocaleTimeString(langSettingSting.value, localTimeOptions.value) : "";
});
const groupSliderEndLabel = computed(() => {
  if (!props.items.length) return "no data";
  const d: Date = new Date(props.items[props.items.length - 1][0] * 1000);
  return d ? d.toLocaleTimeString(langSettingSting.value, localTimeOptions.value) : "";
});
const groupSliderThumbLabelValue = computed(() => {
  if (!props.items.length) return "no data";
  const options: any = {
    hour: "2-digit",
    minute: "2-digit",
  };
  const startValue = modelValue.value;
  const endValue = modelValue.value + 1;
  const defineTime = (value: number) => {
    if (props.items[value]) {
      return new Date(props.items[value][0] * 1000);
    } else {
      return null;
    }
  };
  const start: any = defineTime(startValue);
  const end: any = defineTime(endValue);
  return {
    start: start ? start.toLocaleTimeString("de-GE", options) : start,
    end: end ? end.toLocaleTimeString("de-GE", options) : end,
  };
});
const sliderMaxLength = computed(() => {
  return props.items.length ? props.items.length - 1 : 0;
});
</script>
<style lang="scss">
.time-slider {
  width: 100%;
  display: flex;
  justify-content: space-between;

  .label {
    display: flex;
    align-items: center;

    &:last-of-type {
      text-align: right;
    }
  }

  .time-slider-value {
    flex-grow: 1;
    padding: 0 30px;
  }

  .v-slider__thumb {
    &::before {
      display: none !important;
    }
  }

  .v-slider__thumb-label {
    transform: none !important;
    border-radius: 8px !important;
    bottom: -14px !important;
    left: -20px !important;
    height: 30px !important;
    cursor: pointer !important;
  }

  .v-slider--horizontal .v-slider__thumb-label > * {
    transform: none !important;
  }
}
</style>
