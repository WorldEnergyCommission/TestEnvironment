<!-- eslint-disable vuetify/no-deprecated-components -->
<template>
  <div class="anomaly-detection-default-schema h-100">
    <Stepper v-model="stage">
      <StepperHeader :stage="stage" translation-sub-path="manageAnomalyDetection" />

      <StepperWindow>
        <Step :value="1">
          <template #content>
            <CoreContainer fluid>
              <CoreRow>
                <CoreColumn offset-sm="4" sm="4">
                  <CoreTextField
                    v-model="anomalyDetectionInstance.name"
                    :label="$t('modals.manageAnomalyDetection.form.name')"
                    hide-details
                    max-length="30"
                  />
                </CoreColumn>
              </CoreRow>
            </CoreContainer>
          </template>
          <template #footer>
            <FirstStepActions
              :disable-next-button="!nameValidation"
              :next-button-tool-tip="$t('modals.manageMLModel.tooltips.nameType')"
              :show-back-button="!isEditModal"
              :hide-next-tool-tip="nameValidation"
              @back="$emit('backToChoosingType')"
              @next="stage = 2"
            />
          </template>
        </Step>

        <Step :value="2">
          <template #content>
            <!-- navigation -->
            <div class="d-flex justify-center pt-5">
              <CoreBadge
                :color="mappingsValidation.general ? 'green' : 'error'"
                dot
                offset-x="10"
                floating
              >
                <NavigationTab
                  :is-active="tab === 0"
                  :tab-title="$t('modals.manageAnomalyDetection.mappingsTabs.general')"
                  @click="tab = 0"
                />
              </CoreBadge>
              <CoreBadge
                :color="mappingsValidation.variables ? 'green' : 'error'"
                dot
                offset-x="10"
                floating
              >
                <NavigationTab
                  :is-active="tab === 1"
                  :tab-title="$t('modals.manageAnomalyDetection.mappingsTabs.variables')"
                  @click="tab = 1"
                />
              </CoreBadge>
            </div>

            <!-- content -->
            <!-- general mappings -->
            <div v-show="tab === 0">
              <CoreContainer fluid>
                <CoreRow>
                  <CoreColumn :cols="$vuetify.display.mobile ? 12 : 4">
                    <RangeDatePicker
                      v-if="isStartStopDateComponent"
                      :start-date="anomalyDetectionInstanceMappings.startDate"
                      :end-date="anomalyDetectionInstanceMappings.endDate"
                      class="mt-5"
                      @handle-start-stop-date="handleStartStopDate"
                    />
                  </CoreColumn>

                  <CoreColumn :cols="$vuetify.display.mobile ? 12 : 4">
                    <div>
                      <div
                        v-for="(middleField, middleFieldIndex) in mappingsByColumns.middleMappings"
                        :key="middleFieldIndex"
                        class="mt-2"
                      >
                        <div
                          :class="{
                            'hide-optional':
                              !showOptionalFields && anomalyDetectionMappings[middleField].optional,
                          }"
                        >
                          <div class="optional mb-2">
                            <span v-if="anomalyDetectionMappings[middleField].optional"
                              >optional</span
                            >
                          </div>
                          <component
                            :is="anomalyDetectionMappings[middleField].component"
                            v-model="anomalyDetectionInstanceMappings[middleField]"
                            :items="listDefinition(anomalyDetectionMappings[middleField].items)"
                            :label="
                              $t(
                                `anomalyDetection.${anomalyDetectionInstance.data.type}.mappings.${middleField}.label`,
                              )
                            "
                            :optional="anomalyDetectionMappings[middleField].optional"
                          />
                          <div class="description">
                            {{
                              $t(
                                `anomalyDetection.${anomalyDetectionInstance.data.type}.mappings.${middleField}.description`,
                              )
                            }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CoreColumn>

                  <CoreColumn :cols="$vuetify.display.mobile ? 12 : 4">
                    <div>
                      <div
                        v-for="(outputField, outputFieldIndex) in mappingsByColumns.outputMappings"
                        :key="outputFieldIndex"
                        class="mt-2"
                      >
                        <div
                          :class="{
                            'hide-optional':
                              !showOptionalFields && anomalyDetectionMappings[outputField].optional,
                          }"
                        >
                          <div class="optional mb-2">
                            <span v-if="anomalyDetectionMappings[outputField].optional"
                              >optional</span
                            >
                          </div>
                          <component
                            :is="anomalyDetectionMappings[outputField].component"
                            v-model="anomalyDetectionInstanceMappings[outputField]"
                            :items="listDefinition(anomalyDetectionMappings[outputField].items)"
                            :label="
                              $t(
                                `anomalyDetection.${anomalyDetectionInstance.data.type}.mappings.${outputField}.label`,
                              )
                            "
                            :optional="anomalyDetectionMappings[outputField].optional"
                          />
                          <div class="description">
                            {{
                              $t(
                                `anomalyDetection.${anomalyDetectionInstance.data.type}.mappings.${outputField}.description`,
                              )
                            }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CoreColumn>
                </CoreRow>
              </CoreContainer>
            </div>
            <!-- variables mappings -->
            <div v-show="tab === 1">
              <CoreContainer fluid>
                <CoreRow>
                  <CoreColumn
                    v-for="(variableObj, variableIndex) in anomalyDetectionInstanceVariables"
                    :key="variableIndex"
                    cols="12"
                  >
                    <div class="delete-button-position">
                      <DeleteButton
                        v-if="anomalyDetectionInstanceVariables.length > 1"
                        @click="removeVariable(variableIndex)"
                      >
                      </DeleteButton>
                    </div>
                    <div class="mt-2">
                      <div
                        v-for="(
                          variableField, variableFieldIndex
                        ) in mappingsByColumns.variableMappings"
                        :key="variableFieldIndex"
                      >
                        <div
                          v-if="anomalyDetectionMappings[variableField]"
                          :class="{
                            'hide-optional':
                              !showOptionalFields &&
                              anomalyDetectionMappings[variableField].optional,
                          }"
                        >
                          <component
                            :is="anomalyDetectionMappings[variableField].component"
                            v-model="
                              anomalyDetectionInstanceVariables[variableIndex][variableField]
                            "
                            :items="listDefinition(anomalyDetectionMappings[variableField].items)"
                            :label="$t(`modals.manageAnomalyDetection.form.${variableField}`)"
                            :max-length="variableField === 'unit' ? 4 : undefined"
                            :optional="true"
                            item-text="name"
                            item-value="id"
                            :hide-details="false"
                          />
                        </div>
                      </div>
                    </div>
                    <CoreDivider
                      v-if="variableIndex !== anomalyDetectionInstanceVariables.length - 1"
                      class="divider-spacing"
                    />
                    <CoreButton
                      v-if="variableIndex === anomalyDetectionInstanceVariables.length - 1"
                      :disabled="isMaximumOfVariablesReached"
                      button-type="primary"
                      @click="addVariable"
                    >
                      <template #icon>
                        <CoreIcon>fas fa-plus</CoreIcon>
                      </template>
                      {{ $t("modals.manageAnomalyDetection.addVariable") }}
                    </CoreButton>
                  </CoreColumn>
                </CoreRow>
              </CoreContainer>
            </div>
          </template>
          <template #footer>
            <SecondStepActions
              v-model="showOptionalFields"
              :disable-next-button="!mappingsValidation.all"
              :next-button-tool-tip="$t('modals.manageMLModel.tooltips.requiredFields')"
              :hide-next-tool-tip="mappingsValidation.all"
              :with-optionals="true"
              @back="stage = 1"
              @next="stage = 3"
            />
          </template>
        </Step>

        <Step :value="3">
          <template #content>
            <CoreContainer fluid>
              <CoreRow>
                <CoreColumn offset-sm="3" sm="6">
                  <div>
                    <CoreSelect
                      v-model="anomalyDetectionInstance.collection_id"
                      :items="sortedRooms"
                      :label="$t('modals.manageMLModel.form.areas')"
                      hide-details
                      hide-selected
                      item-title="name"
                      item-value="id"
                    />
                  </div>
                  <div class="mt-4">
                    <CoreSelect
                      v-model="anomalyDetectionInstance.data.selectedWidth"
                      :items="anomalyDetectionInstanceWidthItems"
                      :label="$t('modals.manageAnomalyDetection.form.width')"
                      hide-details
                      hide-selected
                      item-title="name"
                      item-value="id"
                    />
                  </div>
                  <div class="mt-4">
                    <InputFieldNumber
                      v-model.number="anomalyDetectionInstance.data.threshold"
                      :field-rules="[
                        rules.fieldLessThan100,
                        rules.fieldMoreThanNull,
                        rules.required,
                      ]"
                      :is-decimal="true"
                      :label="$t('modals.manageAnomalyDetection.form.threshold')"
                      :max="100"
                      :min="0"
                    />
                  </div>
                </CoreColumn>
              </CoreRow>
            </CoreContainer>
          </template>
          <template #footer>
            <FinalStepActions
              :disable-next-button="!settingsValidation"
              :next-button-tool-tip="$t('modals.manageMLModel.tooltips.areaFields')"
              :hide-next-tool-tip="settingsValidation"
              @back="stage = 2"
              @next="sendForm"
            />
          </template>
        </Step>
      </StepperWindow>
    </Stepper>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { RootState } from "@/store/types";
import DeleteButton from "@/ui/components/components/buttons/DeleteButton.vue";
import {
  FinalStepActions,
  FirstStepActions,
  SecondStepActions,
} from "@/ui/components/modals/components/Actions";
import ComboboxField from "@/ui/components/modals/components/form/ComboboxField.vue";
import ScalingField from "@/ui/components/modals/components/form/ScalingField.vue";
import SelectField from "@/ui/components/modals/components/form/SelectField.vue";
import TextField from "@/ui/components/modals/components/form/TextField.vue";
import InputFieldNumber from "@/ui/components/modals/components/InputFieldNumber.vue";
import StepperHeader from "@/ui/components/modals/components/ManageStepperHeader.vue";
import NavigationTab from "@/ui/components/modals/components/NavigationTab.vue";
import RangeDatePicker from "@/ui/components/modals/components/RangeDatePicker.vue";
import { Step, Stepper, StepperWindow } from "@/ui/components/modals/components/Stepper";
import { Validation } from "@/ui/mixins/validation";

/**
 * Scheme to create, modify a specific device.
 * Specified in the device type definition in store/anomalyDetection/anomalyDetectionTypes.ts
 */
export default defineComponent({
  components: {
    InputFieldNumber,
    ComboboxField,
    TextField,
    SelectField,
    ScalingField,
    RangeDatePicker,
    NavigationTab,
    Step,
    Stepper,
    StepperWindow,
    FirstStepActions,
    SecondStepActions,
    FinalStepActions,
    StepperHeader,
    DeleteButton,
  },
  mixins: [Validation],
  props: {
    deviceData: {
      default: () => ({
        name: "",
        data: {
          type: "",
          meta: {},
          threshold: null,
          selectedWidth: null,
        },
        collection_id: "",
      }),
      type: Object as PropType<any>,
    },
    isEditModal: [Object, Boolean],
    activeRoomId: { default: "", type: String },
  },
  data() {
    const anomalyDetectionInstanceMappings: any = null;
    const anomalyDetectionInstanceVariables: any = [];
    const anomalyDetectionInstance: any = null;

    return {
      stage: 1,
      anomalyDetectionInstance,
      anomalyDetectionInstanceVariables,
      anomalyDetectionInstanceMappings,
      showOptionalFields: false,
      tab: 0,
    };
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    anomalyDetectionState() {
      return (this.$store.state as RootState).anomalyDetection;
    },
    anomalyDetectionInstanceWidthItems() {
      return [
        { id: "half", name: "Half" },
        { id: "full", name: "Full" },
      ];
    },
    /** stages validations */
    nameValidation() {
      return !!this.anomalyDetectionInstance?.name?.length;
    },
    generalMappingsCheck() {
      const requiredFields: any = [
        ...this.mappingsByColumns.middleMappings,
        ...this.mappingsByColumns.outputMappings,
      ].filter((el: any) => !this.anomalyDetectionMappings[el]?.optional);
      const arr: any = Object.entries(this.anomalyDetectionInstanceMappings)
        .filter((el: any) => requiredFields.some((field: string) => field === el[0]))
        .map((el) => el[1]);

      return !arr.some((el: string) => !el);
    },
    variableMappingsCheck() {
      const variablesArr: string[] = this.anomalyDetectionInstanceVariables.map(
        (el: any) => el.var,
      );
      return variablesArr.length && !variablesArr.some((el: string) => !el);
    },
    startStopDateCheck() {
      return this.isStartStopDateComponent
        ? !!this.anomalyDetectionInstanceMappings.startDate &&
            !!this.anomalyDetectionInstanceMappings.endDate
        : true;
    },

    /**
     * Checks all mappings of Anomaly Detection device
     * @return object that contains properties (all, variables, general) with a status value
     */
    mappingsValidation() {
      if (this.stage === 2) {
        return {
          all: this.variableMappingsCheck && this.startStopDateCheck && this.generalMappingsCheck,
          variables: this.variableMappingsCheck,
          general: this.generalMappingsCheck && this.startStopDateCheck,
        };
      }
      return {
        all: false,
        variables: false,
        general: false,
      };
    },
    /**
     * Checks validation on stage 3.
     * @return status of combination collection_id, selectedWidth, threshold fields
     */
    settingsValidation() {
      const checkThreshold = () => {
        return (
          typeof this.anomalyDetectionInstance.data.threshold === "number" &&
          this.anomalyDetectionInstance.data.threshold <= 100 &&
          this.anomalyDetectionInstance.data.threshold >= 0
        );
      };
      return (
        !!this.anomalyDetectionInstance.collection_id.length &&
        !!this.anomalyDetectionInstance.data.selectedWidth &&
        checkThreshold()
      );
    },
    /**
     * Sort the list of rooms by number in name and alphabetically
     * @return list of rooms
     */
    sortedRooms() {
      const sortFn = (a: any, b: any) => {
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
        return 0;
      };
      const filteredByFirstNumbers = this.rooms.filter((room: any) => {
        const filt = /^[0-9]{1,}/g;
        return filt.test(room.name);
      });
      const sortedByNumbers = filteredByFirstNumbers.sort((a: any, b: any) => {
        const aName = a.name.match(/^[0-9]{1,}/g, "");
        const bName = b.name.match(/^[0-9]{1,}/g, "");
        if (+aName > +bName) return 1;
        if (+aName < +bName) return -1;
        return 0;
      });
      const othersRooms = this.rooms
        .filter((room: any) => {
          const filt = /^[0-9]{1,}/g;
          return !filt.test(room.name);
        })
        .sort(sortFn);
      return [...sortedByNumbers, ...othersRooms];
    },
    anomalyDetectionTypes() {
      return this.anomalyDetectionState.anomalyDetectionTypes;
    },
    anomalyDetectionSchema() {
      return this.anomalyDetectionTypes[this.deviceData.data.type];
    },
    anomalyDetectionMappings() {
      return this.anomalyDetectionSchema.mappings;
    },
    mappingsByColumns() {
      if (this.anomalyDetectionInstance?.data?.type) {
        return this.anomalyDetectionSchema.mappingsByColumns;
      } else {
        return [];
      }
    },
    /**
     * Contains list of properties for aggregation methods
     * @return object of routes to i18n translations
     */
    aggregationMethods() {
      return [
        {
          name: this.$t("modals.manageCharts.form.aggregationMethods.averageOfInterval"),
          id: "avg",
        },
        { name: this.$t("modals.manageCharts.form.aggregationMethods.maxOfInterval"), id: "max" },
        { name: this.$t("modals.manageCharts.form.aggregationMethods.minOfInterval"), id: "min" },
        {
          name: this.$t("modals.manageCharts.form.aggregationMethods.firstOfInterval"),
          id: "first",
        },
        { name: this.$t("modals.manageCharts.form.aggregationMethods.lastOfInterval"), id: "last" },
      ];
    },
    isStartStopDateComponent() {
      return this.anomalyDetectionSchema.isStartStopDate;
    },
    measurementsKeys() {
      return this.measurementsState.measurementsKeys;
    },
    isMaximumOfVariablesReached() {
      return this.anomalyDetectionInstanceVariables.length > 10;
    },
    rooms(): any {
      return this.$store.getters["rooms/rooms"];
    },
    project(): any {
      return (this.$store.state as RootState).projects.project;
    },
  },
  watch: {
    stage: [
      {
        handler: "onStageChange",
      },
    ],
  },
  created() {
    this.anomalyDetectionInstance = JSON.parse(JSON.stringify(this.deviceData));
    this.anomalyDetectionInstanceMappings = this.initAnomalyDetectionInstanceMappings();

    if (this.activeRoomId.length && !this.isEditModal)
      this.anomalyDetectionInstanceMappings.collection_id = this.activeRoomId;

    if (!this.isEditModal) this.addVariable();
    if (this.isEditModal) {
      this.anomalyDetectionInstanceMappings = {
        ...this.anomalyDetectionInstanceMappings,
        ...this.deviceData.data.meta.controllerMappings,
      };
      const chartOptionsLocalCopy: any = JSON.parse(
        JSON.stringify(this.deviceData.data.chartOptions),
      );
      this.anomalyDetectionInstanceVariables = chartOptionsLocalCopy.filter(
        (el: any, inx: number, arr: any) => {
          const typesToRemove: string[] = ["Threshold", "AnomalyScore"];
          const isAnomalyScoreMappingFilled =
            !!this.deviceData.data.meta.controllerMappings.anomalyScore.length;
          const isLastValue = arr.length - 1 === inx;
          return (
            !typesToRemove.some((type: string) => type === el.seriesType) &&
            !(isLastValue && isAnomalyScoreMappingFilled)
          );
        },
      );
    }
    // remove Anomaly Score from chartOptions so it doesnt duplicate Anymore
    const hasAnomalyScore = this.anomalyDetectionInstanceVariables.some((element: any) => {
      return element.name === "Anomaly Score";
    });
    if (hasAnomalyScore === true) {
      this.anomalyDetectionInstanceVariables = this.anomalyDetectionInstanceVariables.filter(
        (element: any) => element.name !== "Anomaly Score",
      );
    }
  },
  methods: {
    /**
     * Checks incoming parameter and return list of measurements or some array according to parameter
     * @param key any type
     * @return list of measurements or list of aggregationMethods or array
     */
    listDefinition(key: string | Array<any>) {
      if (Array.isArray(key)) {
        return key;
      } else if (key === "aggregations") {
        return this.aggregationMethods;
      } else {
        return this.measurementsKeys;
      }
    },
    /**
     * Init Anomaly Detection mappings
     * @return object mappings form
     */
    initAnomalyDetectionInstanceMappings() {
      const listOfMappings: any = [
        ...this.mappingsByColumns.outputMappings,
        ...this.mappingsByColumns.middleMappings,
      ];
      let mappings: any = {};
      listOfMappings.forEach((mapping: string) => {
        mappings = { ...mappings, [mapping]: "" };
      });
      return { ...mappings, ...{ startDate: null, endDate: null } };
    },
    /**
     * Init Anomaly Detection variables
     * @return object variables form
     */
    initAnomalyDetectionInstanceVariables() {
      let mappings: any = {};
      this.mappingsByColumns.variableMappings.forEach((mapping: string) => {
        if (mapping === "scaling") {
          mappings = { ...mappings, [mapping]: { min: null, max: null } };
        } else {
          mappings = { ...mappings, [mapping]: "" };
        }
      });
      return { ...mappings, ...{ seriesType: "View", type: "line" } };
    },
    /**
     * Creates new variable
     */
    addVariable() {
      const variableOptions: any = this.initAnomalyDetectionInstanceVariables();
      this.anomalyDetectionInstanceVariables.push(variableOptions);
    },
    /**
     * Remove selected variable
     * @param idx number, index of selected variable
     */
    removeVariable(idx: number) {
      const clone: any = JSON.parse(JSON.stringify(this.anomalyDetectionInstanceVariables));
      clone.splice(idx, 1);
      this.anomalyDetectionInstanceVariables = clone;
    },
    /**
     * Creates rules for device according to errorWarning field,
     * save ids of created rules in current device object
     * @param deviceData current device data object
     */
    async addRulesWhenCreateDevice(deviceData: any) {
      if (!deviceData.data.meta.controllerMappings.errorWarning.length) {
        deviceData.data.meta.warningRule = null;
        deviceData.data.meta.errorRule = null;
      } else {
        const rulesList: any = [
          {
            id: "",
            name: `${deviceData.name} Warning Rule`,
            active: true,
            timeout: 1,
            conditions: [
              {
                variable: deviceData.data.meta.controllerMappings.errorWarning,
                and_or: false,
                condition: "equals",
                target: 1,
              },
            ],
            actions: [
              { type: "alert", params: { type: 1, body: "{{rule}} - Device has a Warning" } },
            ],
            created_at: "",
          },
          {
            id: "",
            name: `${deviceData.name} Error Rule`,
            active: true,
            timeout: 1,
            conditions: [
              {
                variable: deviceData.data.meta.controllerMappings.errorWarning,
                and_or: false,
                condition: "equals",
                target: 2,
              },
            ],
            actions: [
              { type: "alert", params: { type: 2, body: "{{rule}} - Device has an Error" } },
            ],
            created_at: "",
          },
        ];
        const res = await this.addRules({
          project_id: this.project.id,
          rulesList,
        });
        deviceData.data.meta.warningRule = res[0].id;
        deviceData.data.meta.errorRule = res[1].id;
      }
    },
    /**
     * Replacing existing rules with new ones when errorWarning field is changed
     * @param deviceData current device data object
     */
    async addRulesWhenEditDevice(deviceData: any) {
      const oldErrorWarningVar = this.deviceData.data.meta.controllerMappings.errorWarning;
      const newErrorWarningVar = deviceData.data.meta.controllerMappings.errorWarning;
      if (oldErrorWarningVar && !newErrorWarningVar) {
        await Promise.all([
          this.deleteRule({
            project_id: this.project.id,
            rule_id: deviceData.data.meta.warningRule,
          }),
          this.deleteRule({
            project_id: this.project.id,
            rule_id: deviceData.data.meta.errorRule,
          }),
        ]);
      }
      // if errorWarning was changed
      if (oldErrorWarningVar !== newErrorWarningVar) {
        // delete old rules
        if (oldErrorWarningVar) {
          await Promise.all([
            this.deleteRule({
              project_id: this.project.id,
              rule_id: deviceData.data.meta.warningRule,
            }),
            this.deleteRule({
              project_id: this.project.id,
              rule_id: deviceData.data.meta.errorRule,
            }),
          ]);
        }
        // create new rules
        if (newErrorWarningVar) {
          const rulesList: any = [
            {
              id: "",
              name: `${deviceData.name} Warning Rule`,
              active: true,
              timeout: 1,
              conditions: [
                {
                  variable: deviceData.data.meta.controllerMappings.errorWarning,
                  and_or: false,
                  condition: "equals",
                  target: 1,
                },
              ],
              actions: [
                { type: "alert", params: { type: 1, body: "{{rule}} - Device has a Warning" } },
              ],
              created_at: "",
            },
            {
              id: "",
              name: `${deviceData.name} Error Rule`,
              active: true,
              timeout: 1,
              conditions: [
                {
                  variable: deviceData.data.meta.controllerMappings.errorWarning,
                  and_or: false,
                  condition: "equals",
                  target: 2,
                },
              ],
              actions: [
                { type: "alert", params: { type: 2, body: "{{rule}} - Device has an Error" } },
              ],
              created_at: "",
            },
          ];
          const res: any = await this.addRules({
            project_id: this.project.id,
            rulesList,
          });
          const getWarningRule = () => {
            const warningRuleObj: any = res.find(
              (rule: any) => rule.name === `${deviceData.name} Warning Rule`,
            );
            return warningRuleObj.id;
          };
          const getErrorRule = () => {
            const errorRuleObj: any = res.find(
              (rule: any) => rule.name === `${deviceData.name} Error Rule`,
            );
            return errorRuleObj.id;
          };
          deviceData.data.meta.warningRule = getWarningRule();
          deviceData.data.meta.errorRule = getErrorRule();
        }
      }
    },
    handleStartStopDate(e: any) {
      this.anomalyDetectionInstanceMappings = {
        ...this.anomalyDetectionInstanceMappings,
        startDate: e.startDate,
        endDate: e.endDate,
      };
    },
    /**
     * Save device data in data base
     */
    async sendForm() {
      const copy = JSON.parse(JSON.stringify(this.anomalyDetectionInstance));

      const anomalyScore: any = {
        agg: "avg",
        name: this.$t("modals.manageAnomalyDetection.form.anomalyScore"),
        scaling: {
          min: 0,
          max: 100,
        },
        seriesType: "AnomalyScore",
        type: "line",
        unit: "%",
        var: this.anomalyDetectionInstanceMappings.anomalyScore,
      };

      copy.project_id = this.project.id;
      copy.data.chartOptions = this.anomalyDetectionInstanceMappings.anomalyScore.length
        ? [...this.anomalyDetectionInstanceVariables, ...[anomalyScore]]
        : this.anomalyDetectionInstanceVariables;
      copy.data.meta.controllerMappings = this.anomalyDetectionInstanceMappings;

      // rules
      if (!this.isEditModal) {
        await this.addRulesWhenCreateDevice(copy);
      } else {
        await this.addRulesWhenEditDevice(copy);
      }

      this.$emit("handleControl", copy);
      this.$emit("closeDialog");
    },
    onStageChange(val: number) {
      if (val === 2) {
        this.fetchMeasurements(this.$route.params.id as string);
      }
    },
    fetchMeasurements(projectId: string): Promise<void> {
      return this.$store.dispatch("measurements/fetchMeasurements", projectId);
    },
    addRules(payload: any): Promise<any> {
      return this.$store.dispatch("rules/addRules", payload);
    },
    deleteRule(payload: any): Promise<any> {
      return this.$store.dispatch("rules/deleteRule", payload);
    },
  },
});
</script>

<style lang="scss">
.anomaly-detection-default-schema {
  .optional {
    color: gray;
    font-size: 10px;
    height: 15px;
  }

  .description {
    color: gray;
    font-size: 10px;
  }

  .mappings-title {
    height: 30px;
  }

  .add-variable-button-hidden {
    visibility: hidden;
  }
}
</style>
