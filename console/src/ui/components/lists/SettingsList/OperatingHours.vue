<template>
  <CoreRow v-if="loaded">
    <!-- Operating hours -->
    <CoreColumn cols="12" md="6">
      <CoreRow dense>
        <!-- Title -->
        <CoreColumn cols="12" class="text-h6">
          {{ t("uiComponents.settings.operating_hours.operating_hours") }}
        </CoreColumn>
        <!-- Monday -->
        <CoreColumn cols="12">
          <OperatingHourForm
            v-model="data.operating_hours.monday"
            :title="t('uiComponents.weekdays.monday')"
          />
        </CoreColumn>
        <!-- Tuesday -->
        <CoreColumn cols="12">
          <OperatingHourForm
            v-model="data.operating_hours.tuesday"
            :title="t('uiComponents.weekdays.tuesday')"
          />
        </CoreColumn>
        <!-- Wednesday -->
        <CoreColumn cols="12">
          <OperatingHourForm
            v-model="data.operating_hours.wednesday"
            :title="t('uiComponents.weekdays.wednesday')"
          />
        </CoreColumn>
        <!-- Thursday -->
        <CoreColumn cols="12">
          <OperatingHourForm
            v-model="data.operating_hours.thursday"
            :title="t('uiComponents.weekdays.thursday')"
          />
        </CoreColumn>
        <!-- Friday -->
        <CoreColumn cols="12">
          <OperatingHourForm
            v-model="data.operating_hours.friday"
            :title="t('uiComponents.weekdays.friday')"
          />
        </CoreColumn>
        <!-- Saturday -->
        <CoreColumn cols="12">
          <OperatingHourForm
            v-model="data.operating_hours.saturday"
            :title="t('uiComponents.weekdays.saturday')"
          />
        </CoreColumn>
        <!-- Sunday -->
        <CoreColumn cols="12">
          <OperatingHourForm
            v-model="data.operating_hours.sunday"
            :title="t('uiComponents.weekdays.sunday')"
          />
        </CoreColumn>
        <!-- Holiday -->
        <CoreColumn cols="12">
          <OperatingHourForm
            v-model="holidayData"
            :title="t('uiComponents.weekdays.holiday')"
            :disabled="holidayLikeSunday"
          />
        </CoreColumn>
        <!-- Holidays like sundays -->
        <CoreColumn cols="6">
          <CoreCheckbox
            v-model="holidayLikeSunday"
            :label="t('uiComponents.settings.operating_hours.holidayAsSunday')"
            color="accent"
            hide-details
          />
        </CoreColumn>
        <!-- Save Button Operating Hours-->
        <CoreColumn cols="6" class="d-flex justify-end align-center">
          <CoreButton variant="tonal" color="accent" :loading="saving" @click="saveOperatingHours">
            {{ t("uiComponents.buttons.save") }}
          </CoreButton>
        </CoreColumn>
      </CoreRow>
    </CoreColumn>
    <!-- Holidays -->
    <CoreColumn cols="12" md="6">
      <CoreRow dense>
        <CoreColumn cols="12" class="text-h6">
          {{ t("uiComponents.settings.operating_hours.holidays") }}
        </CoreColumn>
        <!-- Country -->
        <CoreColumn cols="12">
          <CoreSelect
            v-model="selectedHolidayCalender"
            variant="outlined"
            hide-details
            :disabled="!useHolidayCalender"
            item-title="text"
            item-value="value"
            :items="countries"
          />
        </CoreColumn>
        <!-- Activate holiday calendar -->
        <CoreColumn cols="12">
          <CoreCheckbox
            v-model="useHolidayCalender"
            :label="t('uiComponents.settings.operating_hours.useHolidayCalender')"
            color="accent"
            hide-details
          />
        </CoreColumn>
        <CoreColumn cols="12" class="text-subtitle-1 d-flex justify-space-between">
          <div>{{ t("uiComponents.settings.operating_hours.customHoliday") }}</div>
          <OperatingHoursAddHolidayForm
            :disabled="false"
            @submit="
              (holiday) => {
                console.log(holiday);
                customHolidays.push(holiday);
              }
            "
          />
        </CoreColumn>
        <CoreColumn cols="12">
          <CoreRow>
            <CoreColumn cols="12">
              <CoreTable height="300px" fixed-header>
                <thead>
                  <tr>
                    <th class="text-left">
                      {{ t("uiComponents.common.date") }}
                    </th>
                    <th class="text-left">
                      {{ t("uiComponents.common.name") }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(holiday, index) in customHolidays"
                    :key="`${holiday.date}_${holiday.name}_${index}`"
                  >
                    <td>{{ formatDateShort(holiday.date) }}</td>
                    <td class="d-flex align-center justify-content-between">
                      <div>{{ holiday.name }}</div>
                      <CoreButton
                        icon
                        color="accent"
                        style="margin-left: auto; margin-right: 0"
                        @click="
                          () => {
                            customHolidays.splice(index, 1);
                          }
                        "
                      >
                        <CoreIcon color="accent" :icon="`fas fa-circle-xmark`" />
                      </CoreButton>
                    </td>
                  </tr>
                </tbody>
              </CoreTable>
            </CoreColumn>
          </CoreRow>
        </CoreColumn>
        <!-- Save Button Holidays -->
        <CoreColumn cols="12" class="d-flex justify-end align-center">
          <CoreButton
            variant="tonal"
            color="accent"
            :loading="savingHolidays"
            @click="saveHolidays"
          >
            {{ t("uiComponents.buttons.save") }}
          </CoreButton>
        </CoreColumn>
      </CoreRow>
    </CoreColumn>
  </CoreRow>
  <CircleSpinner v-else />
</template>

<script setup lang="ts">
import { cloneDeep } from "lodash";
import { reactive, onMounted, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";

import { useToast } from "../../components/ReportMessageComposables";
import { useIntlDate } from "@/composables/useIntlDate";
import CircleSpinner from "@/ui/components/components/CenteredCircleSpinner.vue";
import OperatingHourForm, {
  OperatingScheduleDay,
} from "@/ui/components/lists/SettingsList/OperatingHourForm.vue";
import OperatingHoursAddHolidayForm from "@/ui/components/lists/SettingsList/OperatingHoursAddHolidayForm.vue";
import { getDateFromDateString, getDateString } from "@/utils/utilsFunctions";

export interface OperatingSchedule {
  monday: OperatingScheduleDay;
  tuesday: OperatingScheduleDay;
  wednesday: OperatingScheduleDay;
  thursday: OperatingScheduleDay;
  friday: OperatingScheduleDay;
  saturday: OperatingScheduleDay;
  sunday: OperatingScheduleDay;
  holiday: OperatingScheduleDay;
  holiday_like_sunday?: boolean;
}

// Tranlations
const { formatDateShort } = useIntlDate();
const { t } = useI18n();
const operatingHoursUpdated = t("uiComponents.settings.operating_hours.operatingHoursUpdated");
const holidaysUpdated = t("uiComponents.settings.operating_hours.holidaysUpdated");
const { success } = useToast();
const loaded = ref(false);
const defaultOperatingSchedule = { start: null, end: null, enabled: false } as OperatingScheduleDay;
const data = reactive<{ operating_hours: OperatingSchedule }>({
  operating_hours: {
    monday: cloneDeep(defaultOperatingSchedule),
    tuesday: cloneDeep(defaultOperatingSchedule),
    wednesday: cloneDeep(defaultOperatingSchedule),
    thursday: cloneDeep(defaultOperatingSchedule),
    friday: cloneDeep(defaultOperatingSchedule),
    saturday: cloneDeep(defaultOperatingSchedule),
    sunday: cloneDeep(defaultOperatingSchedule),
    holiday: cloneDeep(defaultOperatingSchedule),
  },
});
const holidayLikeSunday = ref(false);

const holidayData = computed({
  // getter
  get() {
    return holidayLikeSunday.value ? data.operating_hours.sunday : data.operating_hours.holiday;
  },
  // setter
  set(newValue) {
    if (holidayLikeSunday.value) return;
    // Note: we are using destructuring assignment syntax here.
    data.operating_hours.holiday = newValue;
  },
});

const store = useStore();
const saving = ref(false);

async function saveOperatingHours() {
  saving.value = true;
  const newData = { operating_hours: {} } as { operating_hours: OperatingSchedule };

  Object.entries(data.operating_hours).forEach((entry) => {
    const [key, object] = entry;
    // Checks if the day is enabled
    if (object.enabled) {
      // If enabled the set values are included in the newData object
      newData.operating_hours[key as keyof OperatingSchedule] = cloneDeep(object);
    } else {
      // If disabled a empty default day is added
      newData.operating_hours[key as keyof OperatingSchedule] = cloneDeep(defaultOperatingSchedule);
    }
  });

  if (holidayLikeSunday.value) {
    newData.operating_hours.holiday = cloneDeep(newData.operating_hours.sunday);
  }

  newData.operating_hours.holiday_like_sunday = holidayLikeSunday.value;

  const res = await store.dispatch("projects/postProjectOperatingHours", newData);

  updateState(res);

  success(operatingHoursUpdated);

  saving.value = false;
}

async function loadOperatingHours() {
  const res = await store.dispatch("projects/loadProjectOperatingHours");
  updateState(res);
}

function updateState(res: { data?: { operating_hours?: OperatingSchedule } }) {
  if (res.data) {
    data.operating_hours = res.data.operating_hours as OperatingSchedule;
  }
  if (res.data?.operating_hours?.holiday_like_sunday) {
    holidayLikeSunday.value = res.data.operating_hours.holiday_like_sunday;
  } else {
    holidayLikeSunday.value = false;
  }
}

onMounted(async () => {
  await loadOperatingHours();
  await loadHolidays();
  loaded.value = true;
});

const useHolidayCalender = ref(false);
const selectedHolidayCalender = ref<"ch" | "de" | "at" | "it" | null>(null);
const customHolidays = reactive<{ name: string; date: any }[]>([]);

const countries = computed(() => [
  { text: t("auth.register.addressCountrySwitzerland"), value: "ch" },
  { text: t("auth.register.addressCountryGermany"), value: "de" },
  { text: t("auth.register.addressCountryAustria"), value: "at" },
  { text: t("auth.register.addressCountryItaly"), value: "it" },
]);

async function loadHolidays() {
  const res = await store.dispatch("projects/loadHolidays");
  if (res.data) {
    useHolidayCalender.value = res.data.holiday_calender_enabled;
    selectedHolidayCalender.value = res.data.holiday_calender;
    customHolidays.splice(
      0,
      customHolidays.length,
      ...res.data.customHolidays.map((custom_holiday: { name: string; date: any }) => {
        return { name: custom_holiday.name, day: getDateFromDateString(custom_holiday.date) };
      }),
    );
  }
}

const savingHolidays = ref(false);

async function saveHolidays() {
  savingHolidays.value = true;

  await store.dispatch("projects/postHolidays", {
    holiday_calender_enabled: useHolidayCalender.value,
    holiday_calender: selectedHolidayCalender.value,
    customHolidays: customHolidays.map((custom_holiday) => {
      return { name: custom_holiday.name, date: getDateString(custom_holiday.date) };
    }),
  });

  success(holidaysUpdated);

  savingHolidays.value = false;
}
</script>
