<template>
  <div>
    <CoreDialog :model-value="dialog" max-width="500" @click:outside="emit('close')">
      <CoreCard v-if="dialog">
        <!-- Titel -->
        <CoreToolbar color="accent" dark>
          <div v-if="item" class="px-5">
            <!-- Edit mode -->
            <span v-if="item.index !== undefined">
              {{ t("modals.manageRules.schedule.item") }}
              {{ item.index + 1 }}
            </span>
            <!-- Creation mode -->
            <span v-if="item.index === undefined">
              {{ t("modals.manageRules.buttons.addSchedule") }}
            </span>
          </div>
        </CoreToolbar>
        <!-- Form -->
        <CoreCardText v-if="scheduleItem" class="py-8">
          <!-- Whole day or timeframe switch -->
          <div class="mb-8">
            <CoreSwitch
              inset
              hide-details
              :disabled="disabled"
              :model-value="isWholeDayRule"
              :label="t('modals.manageRules.schedule.wholeDay')"
              @update:model-value="toggleWholeDay"
            />
          </div>
          <!-- Input fields for the timeframe -->
          <div v-if="!isWholeDayRule">
            <TimeInputField
              v-model="timeFrom"
              class="mb-5"
              :label="t('modals.manageRules.schedule.timeFrom')"
            />
            <TimeInputField
              v-model="timeTo"
              class="mb-5"
              allow-end-of-day
              :label="t('modals.manageRules.schedule.timeTo')"
            />
          </div>
          <!-- Timezone Select -->
          <TimezoneChooser
            color="accent"
            :current-value="scheduleItem.timezone"
            @on-change="changeTimeZone"
          />
          <!-- Seven Switches for every day of the week -->
          <DaysOfWeekPicker v-model="scheduleItem.activeDays" />
          <div class="text-error text-right">
            {{ validationError }}
          </div>
        </CoreCardText>
        <!-- Buttons -->
        <CoreCardActions class="justify-end">
          <CoreButton button-type="secondary" @click="emit('close')">
            {{ t("uiComponents.buttons.cancel") }}
          </CoreButton>
          <CoreButton :disabled="!!validationError || disabled" button-type="primary" @click="save">
            {{ t("uiComponents.buttons.save") }}
          </CoreButton>
        </CoreCardActions>
      </CoreCard>
    </CoreDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRaw, watch } from "vue";
import { useI18n } from "vue-i18n";

import { formattedTime, isWholeDay, timeStringToObject } from "./ManageRuleUtils";
import { IScheduleItem } from "@/store/modules/rules/types";
import TimezoneChooser from "@/ui/components/components/TimezoneChooser.vue";
import DaysOfWeekPicker from "@/ui/components/modals/components/DaysOfWeekPicker.vue";
import TimeInputField from "@/ui/components/modals/components/TimeInputField.vue";

// Properties
interface Props {
  dialog: boolean;
  disabled: boolean;
  item: IScheduleItem;
}

const props = withDefaults(defineProps<Props>(), {
  dialog: false,
  disabled: false,
});

// Emits
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", value: IScheduleItem): void;
}>();

// Constants
const { t } = useI18n();
// String time for input components
const timeTo = ref<string>("");
const timeFrom = ref<string>("");
// Local data of schedule item, initialized in ManageRule. This is just for reactivity purposes.
const scheduleItem = ref<IScheduleItem>({
  timezone: "",
  activeDays: [],
  timeTo: { hours: 0, minutes: 0 },
  timeFrom: { hours: 0, minutes: 0 },
});

// Computed Properties
const isWholeDayRule = computed(() => {
  return isWholeDay(timeStringToObject(timeFrom.value), timeStringToObject(timeTo.value));
});

const validationError = computed(() => {
  if (timeFrom.value >= timeTo.value) {
    return t("modals.manageRules.schedule.timeValidation");
  }
  return null;
});

// Functions
function toggleWholeDay(value: any) {
  if (!value) {
    timeFrom.value = "08:00";
    timeTo.value = "18:00";
    return;
  }
  timeFrom.value = "00:00";
  timeTo.value = "24:00";
}

function changeTimeZone(timezone: string) {
  scheduleItem.value.timezone = timezone;
}

function save() {
  emit("save", {
    ...scheduleItem.value,
    timeTo: timeStringToObject(timeTo.value),
    timeFrom: timeStringToObject(timeFrom.value),
  } as IScheduleItem);
}

function changeScheduleItem() {
  timeTo.value = formattedTime(props.item?.timeTo);
  timeFrom.value = formattedTime(props.item?.timeFrom);
  scheduleItem.value = { ...(toRaw(props.item) as IScheduleItem) };
}

// Lifecycle Hooks
onMounted(() => {
  changeScheduleItem();
});

// Watchers
watch(
  () => props.item,
  () => {
    changeScheduleItem();
  },
);
</script>
