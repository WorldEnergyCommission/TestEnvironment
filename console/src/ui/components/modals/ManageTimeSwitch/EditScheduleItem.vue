<template>
  <CoreDialog :model-value="dialog" max-width="500" @click:outside="emit('close')">
    <CoreCard v-if="dialog">
      <CoreToolbar color="accent" class="px-4">
        <span v-if="item">
          {{ $t("devices.TimeSwitch.settingsView.schedule") }}
          #{{ (item.index || 0) + 1 }}</span
        >
        <span v-if="!item"> {{ $t("devices.TimeSwitch.settingsView.addSchedule") }}</span>
      </CoreToolbar>
      <CoreCardText v-if="scheduleItem" class="py-8">
        <TimeInputField v-model="time" class="mb-5" />
        <TimezoneChooser
          :current-value="scheduleItem.time.timezone"
          color="accent"
          @on-change="tzChanged"
        />
        <CoreSelect
          v-model="scheduleItem.action"
          :hide-selected="true"
          :items="actionItems"
          :label="settingsViewLangSwitchAction"
          :return-object="false"
        />
        <DaysOfWeekPicker v-model="scheduleItem.activeDays" />
      </CoreCardText>
      <CoreCardActions class="justify-end">
        <CoreButton button-type="secondary" @click="emit('close')">
          {{ $t("uiComponents.buttons.cancel") }}
        </CoreButton>
        <CoreButton button-type="primary" @click="save">
          {{ $t("uiComponents.buttons.save") }}
        </CoreButton>
      </CoreCardActions>
    </CoreCard>
  </CoreDialog>
</template>

<script setup lang="ts">
import moment from "moment";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import { IScheduleItem, ITime } from "./types";
import TimezoneChooser from "../../components/TimezoneChooser.vue";
import { formattedTime } from "../../forms/Rules/ManageRuleUtils";
import DaysOfWeekPicker from "../components/DaysOfWeekPicker.vue";
import TimeInputField from "../components/TimeInputField.vue";

// Properties
interface Props {
  item: IScheduleItem | undefined;
  dialog: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  item: undefined,
  dialog: false,
});

// Emits
const emit = defineEmits<{
  (e: "save", value: IScheduleItem): void;
  (e: "close"): void;
}>();

// Constants
const { t } = useI18n();
const time = ref<string>("");
const defaultItem = ref<IScheduleItem>({
  action: 1,
  activeDays: [...Array(7).keys()].map(() => true),
  time: { hours: 12, minutes: 0, timezone: "Europe/Berlin" },
});
const scheduleItem = ref<IScheduleItem | undefined>(undefined);
const settingsViewLangActionOn = t("devices.TimeSwitch.settingsView.actionOn");
const settingsViewLangActionOff = t("devices.TimeSwitch.settingsView.actionOff");
const settingsViewLangSwitchAction = t("devices.TimeSwitch.settingsView.switchAction");

// Computed Properties
const actionItems = computed(() => {
  return [
    {
      title: settingsViewLangActionOn,
      value: 1,
    },
    {
      title: settingsViewLangActionOff,
      value: 0,
    },
  ];
});

// Functions
function tzChanged(timezone: string) {
  scheduleItem.value!.time.timezone = timezone;
}

function save() {
  const momentTime = moment(time.value, ["HH:mm"]);

  emit("save", {
    ...scheduleItem.value,
    time: {
      hours: momentTime.hours(),
      minutes: momentTime.minutes(),
      timezone: scheduleItem.value!.time.timezone,
    },
  } as IScheduleItem);
}

function itemChanged() {
  if (!props.item) {
    scheduleItem.value = defaultItem.value;
    return;
  }
  time.value = formattedTime(props.item!.time as ITime);
  scheduleItem.value = JSON.parse(JSON.stringify(props.item));
}

// Watchers
watch(
  () => props.item,
  () => itemChanged(),
);

// Lifecycle Hooks
onMounted(() => {
  itemChanged();
});
</script>
