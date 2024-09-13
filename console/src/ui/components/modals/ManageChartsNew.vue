<template>
  <FormModal :form-title="formTitle">
    <template #activator>
      <slot />
    </template>
    <template #content>
      <div class="manage-chart-form">
        <CoreContainer fluid class="manage-chart-form-content h-100 pa-0">
          <CoreRow class="h-100">
            <CoreColumn class="h-100">
              <div class="h-100">
                <Stepper v-model="stage">
                  <StepperHeader :stage="stage" translation-sub-path="manageCharts" />

                  <StepperWindow>
                    <Step :step="1">
                      <template #content>
                        <CoreContainer fluid>
                          <CoreRow>
                            <CoreColumn cols="6" offset="3">
                              <CoreTextField
                                v-model="chartInstance.name"
                                :label="$t('modals.manageCharts.form.name')"
                                autocomplete="off"
                                max-length="30"
                              />
                            </CoreColumn>
                          </CoreRow>
                        </CoreContainer>
                      </template>
                      <template #footer>
                        <FirstStepActions
                          :disable-next-button="!nameTypeValidation"
                          :next-button-tool-tip="$t('modals.manageCharts.tooltips.name')"
                          :hide-next-tool-tip="nameTypeValidation"
                          @next="stage = 2"
                        />
                      </template>
                    </Step>

                    <Step :step="2">
                      <template #content>
                        <CoreContainer fluid>
                          <CoreRow v-if="showLoadingSpinner === false">
                            <CoreColumn
                              v-for="(item, index) in Object.keys(chartInstance.data.chartOptions)"
                              :key="index"
                              cols="12"
                            >
                              <div class="delete-button-position">
                                <!-- DELETE BUTTON -->
                                <DeleteButton
                                  v-if="Object.keys(chartInstance.data.chartOptions).length > 1"
                                  @click="deleteVariable(index)"
                                >
                                </DeleteButton>
                              </div>
                              <!-- Selection between [calculation,view] -->
                              <CoreSelect
                                v-model="selectionArray[index]"
                                :items="selectionTypes"
                                :label="$t('modals.manageCharts.form.exec')"
                                class="pt-6"
                                hide-details
                                item-title="text"
                                item-value="value"
                                type="number"
                                @update:model-value="changeOptions(index)"
                              />

                              <!-- View Part -->
                              <ChartOptions
                                v-if="chartInstance.data.chartOptions[index].seriesType === 'View'"
                                :aggregation-methods="aggregationMethods"
                                :chart-types="chartTypes"
                                :index="index"
                                :item-options="chartInstance.data.chartOptions[index]"
                                :missing-value-strategies="missingValueStrategies"
                                :name="item"
                                @change-disable="handleDisableChange"
                                @item-options-change="onItemOptionsChange"
                              />

                              <!-- Calculation Part -->
                              <ManageChartsCalculation
                                v-if="
                                  chartInstance.data.chartOptions[index].seriesType ===
                                  'Calculation'
                                "
                                :aggregation-methods="aggregationMethods"
                                :chart-types="chartTypes"
                                :index="index"
                                :item-options="chartInstance.data.chartOptions[index]"
                                :missing-value-strategies="missingValueStrategies"
                                :name="item"
                                @change-disable="handleDisableChange"
                                @item-options-change="onItemOptionsChange"
                              />

                              <CoreDivider
                                v-if="
                                  index !== Object.keys(chartInstance.data.chartOptions).length - 1
                                "
                                class="divider-spacing"
                              />
                            </CoreColumn>
                            <!-- Add Button -->
                            <CoreButton
                              v-if="
                                Object.keys(chartInstance.data.chartOptions).length <
                                maxChartVariables
                              "
                              class="mt-3 spacingRight"
                              button-type="primary"
                              @click="addVariable"
                            >
                              <template #icon>
                                <CoreIcon> fas fa-plus</CoreIcon>
                              </template>
                              {{ $t("modals.manageCharts.addVariable") }}
                            </CoreButton>
                          </CoreRow>
                          <CoreRow v-if="showLoadingSpinner === true">
                            <div style="display: flex; margin-left: auto; margin-right: auto">
                              <div class="pr-8" style="display: flex; align-items: center">
                                {{ $t("modals.manageCharts.loadingText") }}
                              </div>
                              <CircleSpinner :size="80" color="accent" />
                            </div>
                          </CoreRow>
                        </CoreContainer>
                      </template>
                      <template #footer>
                        <SecondStepActions
                          :disable-next-button="disableNextButton"
                          :next-button-tool-tip="$t('modals.manageCharts.tooltips.requiredFields')"
                          :hide-next-tool-tip="!disableNextButton"
                          :with-optionals="false"
                          @back="stage = 1"
                          @next="stage = 3"
                        />
                      </template>
                    </Step>

                    <Step :step="3">
                      <template #content>
                        <CoreContainer fluid>
                          <CoreRow>
                            <CoreColumn cols="6" offset="3">
                              <CoreSelect
                                v-model="chartInstance.collection_id"
                                :items="rooms"
                                :label="$t('modals.manageCharts.form.areas')"
                                hide-details
                                hide-selected
                                item-title="name"
                                item-value="id"
                              />
                              <CoreSelect
                                v-model="chartInstance.data.selectedWidth"
                                :items="chartWidthOptions"
                                :label="$t('modals.manageCharts.form.width')"
                                hide-details
                                hide-selected
                                style="padding-top: 10px"
                              />
                            </CoreColumn>
                          </CoreRow>
                        </CoreContainer>
                      </template>
                      <template #footer>
                        <FinalStepActions
                          :disable-next-button="!settingsValidation"
                          :next-button-tool-tip="$t('modals.manageCharts.tooltips.areaFields')"
                          :hide-next-tool-tip="settingsValidation"
                          @back="stage = 2"
                          @next="sendForm"
                        />
                      </template>
                    </Step>
                  </StepperWindow>
                </Stepper>
              </div>
            </CoreColumn>
          </CoreRow>
        </CoreContainer>
      </div>
    </template>
  </FormModal>
</template>

<script setup lang="ts">
import { cloneDeep } from "lodash";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

import { RootState } from "@/store/types";
import DeleteButton from "@/ui/components/components/buttons/DeleteButton.vue";
import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import {
  FinalStepActions,
  FirstStepActions,
  SecondStepActions,
} from "@/ui/components/modals/components/Actions";
import StepperHeader from "@/ui/components/modals/components/ManageStepperHeader.vue";
import { Step, Stepper, StepperWindow } from "@/ui/components/modals/components/Stepper";
import FormModal from "@/ui/components/modals/FormModal.vue";
import ChartOptions from "@/ui/components/modals/ManageCharts/ChartOptions.vue";
import ManageChartsCalculation from "@/ui/components/modals/ManageCharts/ManageChartsCalculation.vue";
import { envLimits } from "@/utils/env";

// Properties
interface Props {
  formTitle: string;
  activeRoomId: string;
  model: object;
}

const props = withDefaults(defineProps<Props>(), {
  formTitle: "",
  activeRoomId: "",
  model: () => ({
    name: "",
    data: {
      type: "chart",
      selectedWidth: "",
      selectedStackingOptions: "",
      chartOptions: [],
    },
    collection_id: "",
  }),
});

// Emits
const emit = defineEmits<{
  (e: "handleControl", value: any): void;
  (e: "close"): void;
}>();

// Constants
const { t } = useI18n();
const store = useStore();
const route = useRoute();
const stage = ref<number>(1);
const dialog = ref<boolean>(false);
const newChart = ref<boolean>(true);
// Contains the selectionTypes Array in order to display the correct form to fill in
const selectionArray = ref<string[]>([]);
// Gets used to disable the next button of stage 2
const disableNextButton = ref<boolean>(false);
const showLoadingSpinner = ref<boolean>(false);
const dialogChangeFromCode = ref<boolean>(false);
const chartOptionsStillToFill = ref<boolean[]>([]);
const chartWidthOptions = ref<string[]>(["full", "half"]);
const maxChartVariables = ref<number>(envLimits.chart.maxChartVariables);
const chartInstance = ref<{
  name: string;
  collection_id: string;
  data: { type: string; chartOptions: any[]; selectedWidth: string };
}>({
  name: "",
  collection_id: "",
  data: { type: "chart", chartOptions: [], selectedWidth: "" },
});

// Computed Properties
const measurementsState = computed(() => {
  return (store.state as RootState).measurements;
});

const selectionTypes = computed(() => {
  return [
    { text: t("modals.manageCharts.form.selectionTypes.view"), value: "View" },
    { text: t("modals.manageCharts.form.selectionTypes.calc"), value: "Calculation" },
  ];
});

const scalingMethods = computed(() => {
  return [
    { text: t("modals.manageCharts.form.scalingMethods.auto"), value: "automatic" },
    { text: t("modals.manageCharts.form.scalingMethods.manual"), value: "manual" },
  ];
});

const chartTypes = computed(() => {
  return [
    { text: t("modals.manageCharts.form.chartTypes.line"), value: "line" },
    { text: t("modals.manageCharts.form.chartTypes.area"), value: "area" },
    { text: t("modals.manageCharts.form.chartTypes.column"), value: "column" },
  ];
});

const aggregationMethods = computed(() => {
  return [
    {
      state: t("modals.manageCharts.form.aggregationMethods.averageOfInterval"),
      abbr: "avg",
    },
    {
      state: t("modals.manageCharts.form.aggregationMethods.timeWeightedAverageOfInterval"),
      abbr: "avgtw",
    },
    {
      state: t("modals.manageCharts.form.aggregationMethods.integralOfInterval"),
      abbr: "integral",
    },
    {
      state: t("modals.manageCharts.form.aggregationMethods.countOfInterval"),
      abbr: "count",
    },
    {
      state: t("modals.manageCharts.form.aggregationMethods.maxOfInterval"),
      abbr: "max",
    },
    {
      state: t("modals.manageCharts.form.aggregationMethods.minOfInterval"),
      abbr: "min",
    },
    {
      state: t("modals.manageCharts.form.aggregationMethods.rangeOfInterval"),
      abbr: "range",
    },
    {
      state: t("modals.manageCharts.form.aggregationMethods.sumOfInterval"),
      abbr: "sum",
    },
    {
      state: t("modals.manageCharts.form.aggregationMethods.firstOfInterval"),
      abbr: "first",
    },
    {
      state: t("modals.manageCharts.form.aggregationMethods.lastOfInterval"),
      abbr: "last",
    },
    {
      state: t("modals.manageCharts.form.aggregationMethods.stddevOfInterval"),
      abbr: "stddev",
    },
    {
      state: t("modals.manageCharts.form.aggregationMethods.varOfInterval"),
      abbr: "var",
    },
    {
      state: t("modals.manageCharts.form.aggregationMethods.diffOfInterval"),
      abbr: "diff",
    },
  ];
});

const missingValueStrategies = computed(() => {
  return [
    {
      state: t("modals.manageCharts.form.missingValueStrategies.lastObservationCarriedForward"),
      abbr: "locf",
    },
    {
      state: t("modals.manageCharts.form.missingValueStrategies.noMissingValueStrategy"),
      abbr: "none",
    },
  ];
});

// Modal steps validation
const nameTypeValidation = computed(() => {
  return !!chartInstance.value.name?.length;
});

const settingsValidation = computed(() => {
  return !!chartInstance.value.collection_id.length;
});

const rooms = computed(() => {
  return store.getters["rooms/rooms"];
});

const measurementsKeys = computed(() => {
  return store.getters["measurements/measurementsKeys"];
});

function setDialogFalse() {
  dialogChangeFromCode.value = true;
  dialog.value = false;
}

function changeOptions(index: any) {
  if (selectionArray.value[index] === "View") {
    chartInstance.value.data.chartOptions[index] = {
      scaling: {
        min: null,
        max: null,
      },
      unit: "",
      type: "line",
      agg: "last",
      name: "",
      seriesType: "View",
      var: "",
    };
  } else {
    chartInstance.value.data.chartOptions[index] = {
      scaling: {
        min: null,
        max: null,
      },
      type: "line",
      name: "",
      seriesType: "Calculation",
      agg: "last",
      calculation: {
        expression: "",
        aggregations: [],
      },
    };
  }
}

/**
 * Handles if the input in the Expressionfield of the Calculation is not correct,
 * user will not be able to create a chart with a wrong Calculation
 */
function handleDisableChange(disbaleValue: any, index: any) {
  chartOptionsStillToFill.value[index] = disbaleValue.val;
  checkDisabled();
}

function checkDisabled() {
  disableNextButton.value = chartOptionsStillToFill.value.some((e) => e === true);
}

function onItemOptionsChange(variableName: any, newOptions: any) {
  chartInstance.value.data.chartOptions[variableName] = newOptions;

  // to trigger re-render
  chartInstance.value = cloneDeep(chartInstance.value);
}

/**
 * Creates new chart variable
 */
function addVariable() {
  let givenSpots: any = [];
  let count = Object.keys(chartInstance.value.data.chartOptions).length + 1;

  // check for Empty spots between the Values, if it fills up the gap first
  Object.keys(chartInstance.value.data.chartOptions).forEach((key: any, index: number) => {
    const strs = key.split("_");
    givenSpots.push(parseInt(strs[1], 10));
  });
  // fixing "Unexpected-Expression-Error" somehow fucks the function up
  givenSpots = givenSpots.sort((a: any, b: any) => {
    return a - b;
  });
  if (Math.max(...givenSpots) > givenSpots.length) {
    if (givenSpots.filter((element: number) => element === 1).length !== 0) {
      for (let i = 0; i < Object.keys(chartInstance.value.data.chartOptions).length; i++) {
        if (givenSpots[i] !== undefined && givenSpots[i + 1] !== undefined) {
          if (givenSpots[i + 1] - givenSpots[i] > 1) {
            count = givenSpots[i] + 1;
            break;
          }
        }
      }
    } else {
      count = 1;
    }
  }

  chartInstance.value.data.chartOptions.push({
    scaling: {
      min: null,
      max: null,
    },
    unit: "",
    type: "line",
    agg: "last",
    name: "",
  });

  selectionArray.value.push("");
  chartOptionsStillToFill.value.push(true);

  // Reactivity fix
  // https://vuejs.org/v2/guide/reactivity.html#For-Objects
  chartInstance.value = { ...chartInstance.value };
  checkDisabled();
}

/**
 * Removes selected chart variable
 * @param index number, index of variable
 */
function deleteVariable(index: number) {
  showLoadingSpinner.value = true;
  chartInstance.value.data.chartOptions.splice(index, 1);
  selectionArray.value.splice(index, 1);
  chartOptionsStillToFill.value.splice(index, 1);

  // Reactivity fix
  chartInstance.value = { ...chartInstance.value };
  checkDisabled();
  const timeOutLength = chartInstance.value.data.chartOptions.length * 300;
  setTimeout(() => (showLoadingSpinner.value = false), timeOutLength);
}

function sendForm() {
  if (
    chartInstance.value.name &&
    Object.keys(chartInstance.value.data.chartOptions).length > 0 &&
    chartInstance.value.collection_id.length > 0
  ) {
    // if nothing is selected the default width Value will be full
    if (chartInstance.value.data.selectedWidth === "") {
      chartInstance.value.data.selectedWidth = "full";
    }
    // sets default value for stacking options
    chartInstance.value.data.selectedStackingOptions = "normal";

    stage.value = 1;
    emit("handleControl", chartInstance.value);

    if (newChart.value === true) {
      // delete chart instance here
      chartInstance.value = {
        name: "",
        data: {
          type: "chart",
          selectedWidth: "",
          chartOptions: [],
        },
        collection_id: "",
      };
      // resets array to fix validation
      chartOptionsStillToFill.value = [];
      // adds the default Variable
      // when you create more than 1 Chart in a row in the Workbench without leaving
      addVariable();
      // resets selectionArray to fix first Combobox
      selectionArray.value = [];
    }
    setDialogFalse();
  }
}

function dialogChange(nextVal: any, val: any) {
  if (val === true && nextVal === false) {
    if (dialogChangeFromCode.value) {
      dialogChangeFromCode.value = false;
      emit("close");
    } else {
      setTimeout(() => {
        dialog.value = true;
      }, 10);
    }
  }
}

function fetchMeasurements(projectId: string): Promise<void> {
  return store.dispatch("measurements/fetchMeasurements", projectId);
}

// Lifecycle Hooks
onMounted(() => {
  fetchMeasurements(route.params.id as string);

  chartInstance.value = JSON.parse(JSON.stringify(props.model));

  // creates an array of boleans to disable the next button with validation
  const arrayLenght = chartInstance.value.data.chartOptions.length;
  chartOptionsStillToFill.value = Array(arrayLenght).fill(false);

  if (props.activeRoomId.length) {
    chartInstance.value.collection_id = props.activeRoomId;
  }

  // loads the executionOptions when editing the chart
  Object.values(chartInstance.value.data.chartOptions).forEach((element: any, index: number) => {
    if (element.calculation === undefined) {
      selectionArray.value.push("View");
    } else {
      selectionArray.value.push("Calculation");
    }
  });

  // if a new Chart is created "newChart" = true, if a chart is modified "newChart" = false
  // after the new Chart is created the chartInstance is deleted an a new one gets created
  // if a chart is modified the chartInstance doesnt get deleted
  if (chartInstance.value.name !== "") {
    newChart.value = false;
  }

  // set one default variable for new Charts
  if (Object.keys(chartInstance.value.data.chartOptions).length === 0) {
    addVariable();
  }
}),
  // Watchers
  watch(
    () => dialog.value,
    () => {
      // No passed params somehow
      dialogChange;
    },
    {
      immediate: true,
      deep: true,
    },
  );
</script>

<style lang="scss">
@import "./src/ui/scss/variables";

.spacingRight {
  margin-right: 70%;
}

.manage-chart-form {
  overflow: hidden;
  height: 80dvh;
}

.manage-chart-form-content {
  flex-grow: 1;
}

.v-stepper {
  .v-window {
    .actions {
      display: flex;
      align-items: center;
    }
  }
}

.stage-1 {
  .v-input--selection-controls {
    padding: 0 !important;
    margin: 0 !important;
  }

  .devices-mappings-config {
    .section-title {
      color: #6cc1fe;
      font-size: 20px;

      margin-left: auto;
      margin-right: auto;
    }
  }
}

.stage-2 {
  .nav-active-button {
    opacity: 0.8;
  }
}

.optional {
  color: gray;
  font-size: 10px;
  height: 15px;
}

.description {
  color: gray;
  font-size: 10px;
}

.pt-122 {
  padding-top: 122px !important;
}
</style>
