<template>
  <CoreForm
    ref="form"
    v-model="valid"
    lazy-validation
    :disabled="!canEdit"
    class="rule-form-wrapper"
  >
    <CoreRow>
      <!-- 1) General -->
      <CoreColumn cols="12">
        <h2 style="padding-bottom: 10px">
          {{ t("modals.manageRules.titles.general") }}
        </h2>
        <CoreTextField
          v-model="ruleLocal.name"
          :rules="nameRules"
          :disabled="!canEdit"
          :label="t('modals.manageRules.name')"
        />
      </CoreColumn>
      <!-- 2) Conditions -->
      <CoreColumn cols="12">
        <h2 class="section-heading">
          {{ t("modals.manageRules.titles.conditions") }}
        </h2>
        <CoreRow v-for="(condition, index) in ruleLocal.conditions" :key="index" dense>
          <CoreColumn v-if="index" cols="12" md="5">
            <CoreSelect
              v-model="condition.and_or"
              hide-selected
              :items="andOR"
              item-value="abbr"
              item-title="state"
              hide-details="auto"
              :disabled="!canEdit"
              :label="t('modals.manageRules.conditionsForm.case')"
            />
          </CoreColumn>
          <CoreColumn cols="12" md="4">
            <CoreCombobox
              v-model="condition.variable"
              hide-selected
              :items="variables"
              hide-details="auto"
              :disabled="!canEdit"
              :rules="variableNameRule"
              :label="t('modals.manageRules.conditionsForm.variable')"
            />
          </CoreColumn>
          <CoreColumn cols="12" md="3">
            <CoreSelect
              v-model="condition.condition"
              hide-selected
              item-title="title"
              item-value="value"
              :items="conditions"
              hide-details="auto"
              :disabled="!canEdit"
              :rules="conditionRule"
              :label="t('modals.manageRules.conditionsForm.condition')"
            />
          </CoreColumn>
          <CoreColumn>
            <CoreTextField
              v-model.number="condition.target"
              type="number"
              :disabled="!canEdit"
              :rules="onlyNumbersRule"
              :label="t('modals.manageRules.conditionsForm.target')"
            />
          </CoreColumn>
          <CoreColumn v-if="index">
            <CoreButton button-type="standardIcon" @click="deleteCondition(index)">
              <CoreIcon>mdi:mdi-close</CoreIcon>
            </CoreButton>
          </CoreColumn>
        </CoreRow>
        <CoreButton button-type="primary" :disabled="!canEdit" @click="addCondition">
          <template #icon>
            <lynus-icon color="theme" name="plus" size="20" />
          </template>
          {{ t("modals.manageRules.buttons.addCondition") }}
        </CoreButton>
      </CoreColumn>
      <!-- 3) Actions -->
      <CoreColumn cols="12">
        <h2 class="section-heading">
          {{ t("modals.manageRules.titles.actions") }}
        </h2>
        <CoreRow dense>
          <div :style="$vuetify.display.mobile ? 'width: 100%;' : ''" class="flex-shrink-1 ma-3">
            <CoreButton
              style="width: 100%"
              button-type="primary"
              :disabled="!canEdit"
              @click="addAction('email')"
            >
              {{ t("modals.manageRules.buttons.addEmailAction") }}
            </CoreButton>
          </div>
          <div :style="$vuetify.display.mobile ? 'width: 100%;' : ''" class="flex-shrink-1 ma-3">
            <CoreButton
              style="width: 100%"
              button-type="primary"
              :disabled="!canEdit"
              @click="addAction('webhook')"
            >
              {{ t("modals.manageRules.buttons.addWebhookAction") }}
            </CoreButton>
          </div>
          <div :style="$vuetify.display.mobile ? 'width: 100%;' : ''" class="flex-shrink-1 ma-3">
            <CoreButton
              style="width: 100%"
              button-type="primary"
              :disabled="!canEdit"
              @click="addAction('alert')"
            >
              {{ t("modals.manageRules.buttons.addAlertAction") }}
            </CoreButton>
          </div>
        </CoreRow>
        <div v-if="ruleLocal != undefined">
          <div v-for="(action, index) in ruleLocal.actions" :key="index" class="mt-5">
            <h3 class="my-3">{{ t("modals.manageRules.action") }} {{ index + 1 }}</h3>
            <component :is="action.type" v-model="action.params" />
            <CoreButton button-type="delete" :disabled="!canEdit" @click="deleteAction(index)">
              {{ t("modals.manageRules.buttons.deleteAction") }}
            </CoreButton>
          </div>
        </div>
      </CoreColumn>
      <!-- 4) Schedule -->
      <CoreColumn cols="12">
        <h2 class="section-heading">
          {{ t("modals.manageRules.titles.schedule") }}
        </h2>
        <!-- Dialog to create or edit a schedule item -->
        <EditRuleScheduleItem
          :disabled="!canEdit"
          :item="scheduleItem!"
          :dialog="showScheduleDialog"
          @save="saveScheduleItem"
          @close="closeScheduleItemDialog"
        />
        <div class="flex-d">
          <div>
            <div v-if="ruleLocal.schedule.length == 0" class="py-2">
              {{ t("modals.manageRules.schedule.alwaysActive") }}
            </div>
            <ScheduleTable
              v-else
              :disabled="!canEdit"
              :schedule-items="ruleLocal.schedule"
              @edit="(index: number) => editScheduleItem(index)"
              @remove="(index: number) => removeScheduleItem(index)"
            />
          </div>
          <CoreButton button-type="primary" :disabled="!canEdit" @click="addScheduleItemDialog">
            <template #icon>
              <lynus-icon color="theme" name="plus" size="20" />
            </template>
            {{ t("modals.manageRules.buttons.addSchedule") }}
          </CoreButton>
        </div>
      </CoreColumn>
      <!-- 5) Other Options -->
      <CoreColumn cols="12">
        <h2 class="section-heading">
          {{ t("modals.manageRules.titles.otherOptions") }}
        </h2>
        <CoreRow dense>
          <CoreColumn cols="12" md="3">
            <CoreCheckbox
              v-model="ruleLocal.active"
              hide-details
              :true-value="true"
              :false-value="false"
              :disabled="!canEdit"
              :class="$vuetify.display.mobile ? 'mt-0' : ''"
              :label="t('modals.manageRules.otherOptionsForm.active')"
            />
          </CoreColumn>
          <CoreColumn cols="12" md="3">
            <CoreTextField
              v-model.number="ruleLocal.timeout"
              :step="1"
              hide-details
              type="number"
              :disabled="!canEdit"
              :max="maxValueTimeout"
              :min="minValueTimeout"
              :rules="onlyNumbersRule"
              :label="t('modals.manageRules.otherOptionsForm.timeout')"
            />
          </CoreColumn>
          <CoreColumn cols="12" md="3">
            <CoreSelect
              v-model="selectedTimeOption"
              hide-details
              hide-selected
              type="number"
              item-title="title"
              item-value="value"
              :items="timeOptions"
              :disabled="!canEdit"
              :label="t('modals.manageRules.otherOptionsForm.timeOptions')"
            />
          </CoreColumn>
        </CoreRow>
      </CoreColumn>
      <CoreColumn cols="12">
        <CoreButton
          v-if="dialogHeader !== '' && tempCreated === false"
          class="mr-5"
          button-type="primary"
          :disabled="!valid || !canEdit"
          @click="saveRule"
        >
          {{ t("modals.manageRules.buttons.createRule") }}
        </CoreButton>
        <CoreButton
          v-if="dialogHeader !== ''"
          class="mr-5"
          button-type="delete"
          :disabled="!canEdit"
          @click="$emit('dismiss')"
        >
          {{ t("modals.manageRules.buttons.close") }}
        </CoreButton>
        <CoreButton
          v-if="dialogHeader === ''"
          class="mr-10"
          button-type="primary"
          :disabled="!valid || !canEdit"
          @click="saveRule"
        >
          {{ t("modals.manageRules.buttons.modifyRule") }}
        </CoreButton>
        <CoreButton
          v-if="dialogHeader === '' && ruleLocal.created_manually"
          class="mr-5"
          button-type="delete"
          :disabled="!canEdit"
          @click="deleteRule({ project_id: projectId, rule_id: ruleLocal.id })"
        >
          {{ t("modals.manageRules.buttons.deleteRule") }}
        </CoreButton>
      </CoreColumn>
    </CoreRow>
  </CoreForm>
</template>
<script lang="ts">
// <component is=""> only really works with options api!?
import alert from "@/ui/components/forms/actions/AlertAction.vue";
import email from "@/ui/components/forms/actions/EmailAction.vue";
import webhook from "@/ui/components/forms/actions/WebhookAction.vue";

export default {
  components: {
    alert,
    email,
    webhook,
  },
};
</script>
<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRaw, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

import EditRuleScheduleItem from "./EditRuleScheduleItem.vue";
import ScheduleTable from "./ScheduleTable.vue";
import { IProject } from "@/store/modules/projects/types";
import { DeleteRulePayload, IAction, IRule, IScheduleItem } from "@/store/modules/rules/types";
import { RootState } from "@/store/types";

// Properties
interface Props {
  isNew: boolean;
  rule: IRule;
}

const props = withDefaults(defineProps<Props>(), {
  isNew: false,
});

// Constants
const form = ref(null);
const { t } = useI18n();
const store = useStore();
const router = useRouter();
const valid = ref<boolean>(false);
const dialogHeader = ref<string>("");
const minValueTimeout = ref<number>(1);
// Variable used to hide "Create Rule" Button until validation is done
const tempCreated = ref<boolean>(false);
const prevTimeOption = ref<string>("sec");
const maxValueTimeout = ref<number>(604800);
// Variable used to hide different things for the connectivity Rule
const selectedTimeOption = ref<string>("sec");
const showScheduleDialog = ref<boolean>(false);
const scheduleItem = ref<IScheduleItem | null>(null);
const conditionRule = [(v: any) => v.length !== 0 || "Condition required"];
const onlyNumbersRule = [
  (v: any) => /^\d+(\.\d+)?$/.test(v) === true || "Only numbers are allowed",
];
const defaultScheduleItem = ref<IScheduleItem>({
  timeFrom: { hours: 0, minutes: 0 },
  timeTo: { hours: 24, minutes: 0 },
  timezone: "Europe/Berlin",
  activeDays: [...Array(7).keys()].map(() => true),
});
const ruleLocal = ref<IRule>({
  id: "",
  name: "",
  active: false,
  timeout: 1,
  conditions: [{ variable: "", and_or: false, condition: "", target: 0 }],
  actions: [],
  schedule: [],
  and_or: false,
  condition: "equals",
  target: 1,
  variable: "",
  created_at: "",
  created_manually: true,
});

// Computed Properties
const nameRules = computed(() => {
  return [
    (v: any) => (v && v.length !== 0) || t("modals.manageReport.errorMessages.nameRule1"),
    (v: any) => (v && v.length <= 100) || t("modals.manageReport.errorMessages.nameRule2"),
  ];
});

const variableNameRule = computed(() => {
  return [
    (v: any) => (v && v.length !== 0) || t("modals.manageReport.errorMessages.variableNameRule"),
  ];
});

const projectId = computed(() => {
  return project.value!.id;
});

const canEdit = computed(() => {
  return (
    (props.rule && hasCurrentMemberScopedPermission.value("writeRule", props.rule.id)) ||
    (!props.rule && hasCurrentMemberPermission.value("createRule"))
  );
});

const andOR = computed(() => {
  return [
    { state: t("modals.manageRules.conditionsForm.andOr.and"), abbr: true },
    { state: t("modals.manageRules.conditionsForm.andOr.or"), abbr: false },
  ];
});

const conditions = computed(() => {
  return [
    { title: t("modals.manageRules.conditions.less"), value: "less" },
    { title: t("modals.manageRules.conditions.lessEquals"), value: "less_equals" },
    { title: t("modals.manageRules.conditions.equals"), value: "equals" },
    { title: t("modals.manageRules.conditions.notEquals"), value: "not_equals" },
    { title: t("modals.manageRules.conditions.greaterEquals"), value: "greater_equals" },
    { title: t("modals.manageRules.conditions.greater"), value: "greater" },
  ];
});

const timeOptions = computed(() => {
  return [
    { title: t("modals.manageRules.timeOptions.sec"), value: "sec" },
    { title: t("modals.manageRules.timeOptions.min"), value: "min" },
    { title: t("modals.manageRules.timeOptions.hour"), value: "hour" },
    { title: t("modals.manageRules.timeOptions.day"), value: "day" },
  ];
});

const actions = computed(() => {
  return ruleLocal.value.actions;
});

const variables = computed(() => {
  return store.getters["measurements/measurementsKeys"];
});

const hasCurrentMemberScopedPermission = computed<(permission: string, scope: string) => boolean>(
  () => {
    return store.getters["members/hasScopedPermission"];
  },
);

const hasCurrentMemberPermission = computed<(permission: string) => boolean>(() => {
  return store.getters["members/hasPermission"];
});

const project = computed<IProject>(() => {
  return (store.state as RootState).projects.project;
});

// Functions
function addScheduleItemDialog() {
  scheduleItem.value = { ...defaultScheduleItem.value };
  showScheduleDialog.value = true;
}

function editScheduleItem(index: number) {
  scheduleItem.value = { ...ruleLocal.value.schedule[index], index };
  showScheduleDialog.value = true;
}

function removeScheduleItem(index: number) {
  ruleLocal.value.schedule.splice(index, 1);
}

function closeScheduleItemDialog() {
  showScheduleDialog.value = false;
}

function saveScheduleItem(item: IScheduleItem) {
  showScheduleDialog.value = false;

  const itemCopy: IScheduleItem = toRaw(item);

  if (item.index === undefined) {
    ruleLocal.value.schedule.push(itemCopy);
    return;
  }
  ruleLocal.value.schedule[itemCopy.index as number] = itemCopy;
}

// addCondition pushes an empty condition to the condition list
function addCondition() {
  ruleLocal.value.conditions.push({
    and_or: false,
    target: 0,
    variable: "",
    condition: "equals",
  });
  nextTick(async () => await ((form.value as any).coreForm as any).validate());
}

/**
 * deleteCondition removes a condition at a specific index
 * @param index number, condition index
 */
function deleteCondition(index: number) {
  ruleLocal.value.conditions.splice(index, 1);
}

/**
 * addAction pushes a new action for a specific type to the actions list
 * @param type string, action type key
 */
function addAction(type: string) {
  const action = { type, params: {} };

  switch (type) {
    case "webhook":
      action.params = {
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
        body: "{{rule}} - ",
        url: "",
      };
      break;
    case "email":
      action.params = {
        recipients: ["example@mail.com"],
        subject: "",
        body: "{{rule}} - ",
      };
      break;
    case "alert":
      action.params = {
        type: 0,
        body: "{{rule}} - ",
      };
      break;
  }
  ruleLocal.value.actions = [...ruleLocal.value.actions, action as IAction];
  nextTick(async () => await ((form.value as any).coreForm as any).validate());
}

/**
 * deleteAction removes an action from the action list at a specific index
 * @param index number, action index
 */
function deleteAction(index: number) {
  ruleLocal.value.actions.splice(index, 1);
}

async function saveRule() {
  // converts the timeout (could be in min,hour,day) into seconds for the api to store the value in seconds
  if (ruleLocal.value.timeout !== 0) {
    if (selectedTimeOption.value === "min") {
      ruleLocal.value.timeout *= 60;
    } else if (selectedTimeOption.value === "hour") {
      ruleLocal.value.timeout *= 3600;
    } else if (selectedTimeOption.value === "day") {
      ruleLocal.value.timeout *= 86400;
    }
  }

  // separate between new Rule and a already existing Rule
  if (dialogHeader.value === "") {
    await store.dispatch("rules/modifyRule", {
      project_id: projectId.value,
      rule: ruleLocal.value,
    });
    tempCreated.value = true;
  } else {
    await store.dispatch("rules/addRule", {
      id: projectId.value,
      ruleModel: ruleLocal.value,
    });
    tempCreated.value = true;
    router.go(0);
  }

  // converts the timeout back into the selected timeOption
  if (ruleLocal.value.timeout !== 0) {
    if (selectedTimeOption.value === "min") {
      ruleLocal.value.timeout /= 60;
    } else if (selectedTimeOption.value === "hour") {
      ruleLocal.value.timeout /= 3600;
    } else if (selectedTimeOption.value === "day") {
      ruleLocal.value.timeout /= 86400;
    }
  }
}

function recalculateTimeout() {
  switch (selectedTimeOption.value) {
    case "sec":
      if (prevTimeOption.value === "min") {
        ruleLocal.value.timeout *= 60;
      } else if (prevTimeOption.value === "hour") {
        ruleLocal.value.timeout *= 3600;
      } else if (prevTimeOption.value === "day") {
        ruleLocal.value.timeout *= 86400;
      }
      maxValueTimeout.value = 604800;
      break;
    case "min":
      if (prevTimeOption.value === "sec") {
        ruleLocal.value.timeout /= 60;
      } else if (prevTimeOption.value === "hour") {
        ruleLocal.value.timeout *= 60;
      } else if (prevTimeOption.value === "day") {
        ruleLocal.value.timeout *= 1440;
      }
      maxValueTimeout.value = 10080;
      break;
    case "hour":
      if (prevTimeOption.value === "sec") {
        ruleLocal.value.timeout /= 3600;
      } else if (prevTimeOption.value === "min") {
        ruleLocal.value.timeout /= 60;
      } else if (prevTimeOption.value === "day") {
        ruleLocal.value.timeout *= 24;
      }
      maxValueTimeout.value = 168;
      break;
    case "day":
      if (prevTimeOption.value === "sec") {
        ruleLocal.value.timeout /= 86400;
      } else if (prevTimeOption.value === "min") {
        ruleLocal.value.timeout /= 1440;
      } else if (prevTimeOption.value === "hour") {
        ruleLocal.value.timeout /= 24;
      }
      maxValueTimeout.value = 7;
      break;
  }

  // previous timeOption is needed to reCalculate the Time correctly, it is allways changed after the recalculation took place
  prevTimeOption.value = selectedTimeOption.value;

  ruleLocal.value.timeout = Math.round(ruleLocal.value.timeout);

  if (ruleLocal.value.timeout < 1) {
    ruleLocal.value.timeout = 1;
  }
}

// Get a the data for a rule
function initLocalState() {
  // create reactive local deep clone that doesnt affect the stored rule until the rule is saved with "Modify Rule" button
  ruleLocal.value = { ...ruleLocal.value, ...props.rule };
}

function fetchMeasurements(projectId: string): Promise<void> {
  return store.dispatch("measurements/fetchMeasurements", projectId);
}

function deleteRule(payload: DeleteRulePayload): Promise<Promise<void>> {
  return store.dispatch("rules/deleteRule", payload);
}

// Watchers
watch(
  () => selectedTimeOption.value,
  () => {
    recalculateTimeout();
  },
);

watch(
  () => props.rule,
  () => {
    initLocalState();
  },
);

// Lifecycle Hooks
onMounted(async () => {
  initLocalState();

  fetchMeasurements(projectId.value as string);

  // set Title if new Rule is Created
  if (props.isNew) {
    dialogHeader.value = "Create new Rule";
    tempCreated.value = false;
  } else {
    dialogHeader.value = "";
    tempCreated.value = true;
  }

  await ((form.value as any).coreForm as any).validate();
});
</script>

<style scoped lang="scss">
.section-heading {
  padding-bottom: 15px;
  padding-top: 20px;
  border-top: grey solid 1px;
}

.rule-form-wrapper {
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>
