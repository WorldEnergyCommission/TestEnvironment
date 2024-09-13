<template>
  <CoreDataTable :items="scheduleItems" :items-per-page="-1" disable-filtering>
    <template v-if="!$vuetify.display.mobile" #body="{ items }">
      <tr v-for="(item, index) in items" :key="index">
        <td>{{ t("modals.manageRules.schedule.item") }} #{{ index + 1 }}</td>
        <td>
          {{
            isWholeDayScheduleItem(item)
              ? t("modals.manageRules.schedule.wholeDay")
              : `${formattedTime(item.timeFrom)} → ${formattedTime(item.timeTo)}`
          }}
        </td>
        <td>
          {{ getActiveDaysShort(item.activeDays) }}
        </td>
        <td>
          <CoreButton :disabled="disabled" button-type="icon" @click.stop="emit('edit', index)">
            <CoreIcon> mdi:mdi-pencil</CoreIcon>
          </CoreButton>
          <CoreButton
            class="ml-2"
            button-type="deleteIcon"
            :disabled="disabled"
            @click.stop="emit('remove', index)"
          >
            <CoreIcon> mdi:mdi-delete</CoreIcon>
          </CoreButton>
        </td>
      </tr>
    </template>
    <!-- TODO: Check if this part is ever nessesary, its seem to be redundant -->
    <template v-else #body="{ items }">
      <tr v-for="(item, index) in items" :key="index" class="v-data-table__mobile-table-row" v>
        <td class="v-data-table__mobile-row">
          <div class="v-data-table__mobile-row__header">Name</div>
          <div class="v-data-table__mobile-row__cell">
            {{ t("modals.manageRules.schedule.item") }} #{{ index + 1 }}
          </div>
        </td>
        <td class="v-data-table__mobile-row">
          <div class="v-data-table__mobile-row__header">Timeframe</div>
          <div class="v-data-table__mobile-row__cell">
            {{
              isWholeDayScheduleItem(item)
                ? t("modals.manageRules.schedule.wholeDay")
                : `${formattedTime(item.timeFrom)} → ${formattedTime(item.timeTo)}`
            }}
          </div>
        </td>
        <td class="v-data-table__mobile-row">
          <div class="v-data-table__mobile-row__header">Schedule</div>
          <div class="v-data-table__mobile-row__cell">
            {{ getActiveDaysShort(item.activeDays) }}
          </div>
        </td>
        <td class="v-data-table__mobile-row">
          <div class="v-data-table__mobile-row__header">Edit/Delete</div>
          <div class="v-data-table__mobile-row__cell">
            <CoreButton button-type="icon" @click.stop="emit('edit', index)">
              <CoreIcon> mdi:mdi-pencil</CoreIcon>
            </CoreButton>
            <CoreButton class="ml-2" button-type="deleteIcon" @click.stop="emit('remove', index)">
              <CoreIcon> mdi:mdi-delete</CoreIcon>
            </CoreButton>
          </div>
        </td>
      </tr>
    </template>
  </CoreDataTable>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { isWholeDay, formattedTime, getActiveDaysShort } from "./ManageRuleUtils";
import { IScheduleItem } from "@/store/modules/rules/types";

// Properties
interface Props {
  scheduleItems: IScheduleItem[];
  disabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

// Emits
const emit = defineEmits<{
  (e: "edit", value: number): void;
  (e: "remove", value: number): void;
}>();

// Constants
const { t } = useI18n();

// Functions
function isWholeDayScheduleItem(item: IScheduleItem) {
  return isWholeDay(item.timeFrom, item.timeTo);
}
</script>
