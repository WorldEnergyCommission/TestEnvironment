<template>
  <div :class="`${$vuetify.display.mobile ? '' : 'mr-3'} flex-grow-1`">
    <CoreRow v-if="showTimeSelection" density="compact">
      <!-- Buttons -->
      <CoreColumn
        cols="12"
        md="6"
        :class="`nav-buttons fill-height d-flex justify-${$vuetify.display.mobile ? 'center' : 'end'}`"
      >
        <CoreButtonToggle
          style="height: 40px"
          mandatory
          :model-value="modeIndex"
          :class="$vuetify.display.mobile ? '' : 'pe-3'"
        >
          <CoreButton
            v-for="(item, i) in modeItems"
            :key="i"
            :disabled="disableNavButton"
            size="small"
            transparent-bg
            button-type="primary"
            @click="onModeChange(item.id)"
          >
            <template #icon>
              <CoreIcon size="medium">
                {{ item.icon }}
              </CoreIcon>
            </template>
            {{ item.name }}
          </CoreButton>
        </CoreButtonToggle>
      </CoreColumn>
      <!-- Range -->
      <CoreColumn cols="12" md="3" class="fill-height d-flex justify-center">
        <CoreSelect
          v-model="outputPeriod"
          v-model:menu="selectHackFix"
          hide-details
          hide-selected
          item-value="id"
          density="compact"
          item-title="name"
          :rounded="true"
          :items="periodItems"
          :disabled="disableNavButton"
          :label="t('modals.manageCharts.form.rangeOption')"
          @update:focused="(val) => (selectHackFix = val)"
          @update:model-value="onPeriodChange($event)"
        />
      </CoreColumn>
      <!-- Interval -->
      <CoreColumn cols="12" md="3" class="fill-height d-flex justify-center">
        <CoreSelect
          v-model:menu="selectHackFix2"
          hide-details
          hide-selected
          item-value="id"
          density="compact"
          item-title="name"
          :rounded="true"
          :model-value="outputInterval"
          :items="intervalItems"
          :disabled="disableNavButton"
          :label="t('modals.manageCharts.form.intervalOption')"
          @update:focused="(val) => (selectHackFix2 = val)"
          @update:model-value="onIntervalChange($event)"
        />
      </CoreColumn>
    </CoreRow>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify/lib/framework.mjs";

import {
  ChartMode,
  getDefaultInterval,
  getDefaultPeriod,
  isRelativePeriod,
  Periods,
  useDefaultPeriods,
  useIntervalOptions,
} from "./ChartUtils";

// Properties
interface Props {
  isHalfWidth?: boolean;
  disableNavButton: boolean;
  showTimeSelection?: boolean;
  navigationItemsToExclude?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  isHalfWidth: false,
  showTimeSelection: true,
  navigationItemsToExclude: () => [""],
});

// Models
const outputPeriod = defineModel<string>("outputPeriod", { default: "" });
const outputInterval = defineModel<string>("outputInterval", { default: "" });

// Constants
const { t } = useI18n();
const { mdAndDown } = useDisplay();
const defaultItems = useDefaultPeriods();
const selectHackFix = ref<boolean>(false);
const selectHackFix2 = ref<boolean>(false);

// Items for select inputs
const intervalItems = useIntervalOptions(outputPeriod);
const periodItems = computed(() => {
  if (mode.value == ChartMode.LIVE) {
    return items.value!.filter((el: any) => el.id === Periods.LIVE);
  } else if (mode.value === ChartMode.ABSOLUTE) {
    return items.value!.filter((el: any) => el.id !== Periods.LIVE && !isRelativePeriod(el.id));
  } else if (mode.value === ChartMode.RELATIVE) {
    return items.value!.filter((el: any) => el.id !== Periods.LIVE && isRelativePeriod(el.id));
  }
  return items.value!;
});

// Computed Properties
const items = computed<{ id: string; name: string }[]>(() => {
  if (props.navigationItemsToExclude) {
    props.navigationItemsToExclude.forEach((btn: any) => {
      return defaultItems.value.filter((el: any) => el.id !== btn);
    });
  }

  return defaultItems.value;
});

const isShort = computed<boolean>(() => {
  return mdAndDown.value || props.isHalfWidth;
});

const modeItems = computed<{ id: string; name: string; icon: string }[]>(() => {
  const modeItems = [
    {
      id: ChartMode.ABSOLUTE,
      name: t(`uiComponents.chartNavigation.ABSOLUTE_MODE${isShort.value ? "_SHORT" : ""}`),
      icon: "fas fa-clock",
    },
    {
      id: ChartMode.RELATIVE,
      name: t(`uiComponents.chartNavigation.RELATIVE_MODE${isShort.value ? "_SHORT" : ""}`),
      icon: "fas fa-clock-rotate-left",
    },
  ];

  if (items.value!.filter((el: any) => el.id === Periods.LIVE).length > 0) {
    modeItems.unshift({
      id: ChartMode.LIVE,
      name: t("uiComponents.chartNavigation.LIVE_MODE"),
      icon: "fas fa-circle-dot",
    });
  }

  return modeItems;
});

const mode = computed<string>(() => {
  if (outputPeriod.value === Periods.LIVE) {
    return ChartMode.LIVE;
  } else if (outputPeriod.value.startsWith("last_")) {
    return ChartMode.RELATIVE;
  } else {
    return ChartMode.ABSOLUTE;
  }
});

const modeIndex = computed(() => {
  return modeItems.value.map((x) => x.id).indexOf(mode.value);
});

// Changes the period
function onPeriodChange(period: string) {
  outputPeriod.value = period;
  outputInterval.value = getDefaultInterval(period);
}

// Changes the interval
function onIntervalChange(interval: string) {
  outputInterval.value = interval;
}

// Initializes period and interval with defaults based on the mode
function onModeChange(mode: string) {
  if (mode === ChartMode.LIVE) {
    outputPeriod.value = getDefaultPeriod(mode);
    outputInterval.value = getDefaultInterval(getDefaultPeriod(mode));
  } else if (mode === ChartMode.ABSOLUTE) {
    outputPeriod.value = getDefaultPeriod(mode);
    outputInterval.value = getDefaultInterval(getDefaultPeriod(mode));
  } else if (mode == ChartMode.RELATIVE) {
    outputPeriod.value = getDefaultPeriod(mode);
    outputInterval.value = getDefaultInterval(getDefaultPeriod(mode));
  }
}

// TODO: parent props are chartData.data.map((el) => el.interval and el.period)
function saveTimeConfig() {}

function getTimeConfig() {}
</script>
