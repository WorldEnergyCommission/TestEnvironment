<!-- eslint-disable vuetify/no-deprecated-components -->
<template>
  <div class="hco-schema">
    <Stepper v-model="stage">
      <StepperHeader :stage="stage" translation-sub-path="manageMLModel" />
      <StepperWindow>
        <Step :value="1">
          <template #content>
            <CoreContainer fluid>
              <CoreRow>
                <CoreColumn offset-sm="4" sm="4">
                  <CoreTextField
                    v-model="mlModel.name"
                    :label="$t('modals.manageDevice.form.name')"
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
            <CoreContainer fluid>
              <!-- add additional areas button -->
              <CoreRow>
                <CoreColumn cols="12">
                  <CoreButton button-type="primary" @click="addAdditionalArea">
                    <template #icon>
                      <CoreIcon> fas fa-plus</CoreIcon>
                    </template>
                    {{ $t("modals.manageMLModel.addRoomTempButton") }}
                  </CoreButton>
                </CoreColumn>
              </CoreRow>

              <!-- step 2 mappings fields -->
              <CoreRow>
                <!-- col 1, input mappings -->
                <CoreColumn :cols="$vuetify.display.mobile ? 12 : 4">
                  <div>
                    <div class="mappings-title">
                      {{ $t("modals.manageMLModel.inputMappings") }}
                    </div>
                    <div>
                      <!-- start date field, calendar -->
                      <div class="mt-2">
                        <div class="optional mb-2" />
                        <DatePickerCustom
                          v-model="startDate"
                          :label="$t('modals.manageMLModel.startDate')"
                          @date-picker-custom-clear-date="datePickerCustomClearDate"
                        />
                        <div style="height: 14px" />
                        <div class="description" />
                      </div>

                      <!-- controller mappings -->
                      <div>
                        <!-- additional areas fields -->
                        <div
                          v-for="(additionalItem, additionalIndex) in additionalAreasKeys"
                          :key="`i-${additionalIndex}`"
                          class="mt-2 flex flex-nowrap"
                        >
                          <div class="optional mb-2" />
                          <component
                            :is="'v-combobox'"
                            v-model="additionalAreas[additionalItem]"
                            :items="measurementsKeys"
                            color="accent"
                            hide-details
                            hide-selected
                            label="Additional Room temperature"
                            variant="outlined"
                          >
                            <template #append-outer>
                              <div>
                                <CoreButton
                                  class="ml-1 mt-1"
                                  color="red"
                                  elevation="0"
                                  :rounded="true"
                                  unded="true"
                                  size="x-small"
                                  @click="removeAdditionalArea(additionalItem)"
                                >
                                  <lynus-icon color="white" name="x" />
                                </CoreButton>
                              </div>
                            </template>
                          </component>
                          <div style="height: 14px" />
                          <div class="description" />
                        </div>

                        <!-- mappings -->
                        <div
                          v-for="(inputField, inputFieldIndex) in mappingsByColumns.inputMappings"
                          :key="inputFieldIndex"
                          class="mt-2"
                        >
                          <div
                            :class="{
                              'hide-optional':
                                !showOptionalFields && mlModelMappings[inputField].optional,
                            }"
                          >
                            <div class="optional mb-2">
                              <span v-if="mlModelMappings[inputField].optional">optional</span>
                            </div>
                            <component
                              :is="mlModelMappings[inputField].vuetifyComponent"
                              v-model="controllerMappingsLocal[inputField]"
                              :items="listDefinition(mlModelMappings[inputField].items)"
                              :label="
                                $t(
                                  `mlModel.${mlModel.data.type}.controllerMappings.${inputField}.label`,
                                )
                              "
                              :optional="mlModelMappings[inputField].optional"
                            />
                            <div class="description">
                              {{
                                $t(
                                  `mlModel.${mlModel.data.type}.controllerMappings.${inputField}.description`,
                                )
                              }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CoreColumn>

                <!-- col 2, middle mappings -->
                <CoreColumn :cols="$vuetify.display.mobile ? 12 : 4">
                  <div>
                    <div class="mappings-title" />
                    <div>
                      <div
                        v-for="(middleField, middleFieldIndex) in mappingsByColumns.middleMappings"
                        :key="middleFieldIndex"
                        class="mt-2"
                      >
                        <div
                          :class="{
                            'hide-optional':
                              !showOptionalFields && mlModelMappings[middleField].optional,
                          }"
                        >
                          <div class="optional mb-2">
                            <span v-if="mlModelMappings[middleField].optional">optional</span>
                          </div>
                          <component
                            :is="mlModelMappings[middleField].vuetifyComponent"
                            v-model="controllerMappingsLocal[middleField]"
                            :items="listDefinition(mlModelMappings[middleField].items)"
                            :label="
                              $t(
                                `mlModel.${mlModel.data.type}.controllerMappings.${middleField}.label`,
                              )
                            "
                            :optional="mlModelMappings[middleField].optional"
                          />
                          <div class="description">
                            {{
                              $t(
                                `mlModel.${mlModel.data.type}.controllerMappings.${middleField}.description`,
                              )
                            }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CoreColumn>

                <!-- col 3, output mappings -->
                <CoreColumn :cols="$vuetify.display.mobile ? 12 : 4">
                  <div>
                    <div class="mappings-title">
                      {{ $t("modals.manageMLModel.outputMappings") }}
                    </div>
                    <div>
                      <div
                        v-for="(outputField, outputFieldIndex) in mappingsByColumns.outputMappings"
                        :key="outputFieldIndex"
                        class="mt-2"
                      >
                        <div
                          :class="{
                            'hide-optional':
                              !showOptionalFields && mlModelMappings[outputField].optional,
                          }"
                        >
                          <div class="optional mb-2">
                            <span v-if="mlModelMappings[outputField].optional">optional</span>
                          </div>
                          <component
                            :is="mlModelMappings[outputField].vuetifyComponent"
                            v-model="controllerMappingsLocal[outputField]"
                            :items="listDefinition(mlModelMappings[outputField].items)"
                            :label="
                              $t(
                                `mlModel.${mlModel.data.type}.controllerMappings.${outputField}.label`,
                              )
                            "
                            :optional="mlModelMappings[outputField].optional"
                          />
                          <div class="description">
                            {{
                              $t(
                                `mlModel.${mlModel.data.type}.controllerMappings.${outputField}.description`,
                              )
                            }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CoreColumn>
              </CoreRow>
            </CoreContainer>
          </template>
          <template #footer>
            <SecondStepActions
              v-model="showOptionalFields"
              :disable-next-button="!mappingValidation"
              :next-button-tool-tip="$t('modals.manageMLModel.tooltips.requiredFields')"
              :hide-next-tool-tip="mappingValidation"
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
                  <CoreSelect
                    v-model="mlModel.collection_id"
                    :items="sortedRooms"
                    :label="$t('modals.manageMLModel.form.areas')"
                    hide-details
                    hide-selected
                    item-title="name"
                    item-value="id"
                  />
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
import { VCombobox } from "vuetify/components";

import {
  FinalStepActions,
  FirstStepActions,
  SecondStepActions,
} from "@/ui/components/modals/components/Actions";
import DatePickerCustom from "@/ui/components/modals/components/DatePickerCustom.vue";
import ComboboxField from "@/ui/components/modals/components/form/ComboboxField.vue";
import SelectField from "@/ui/components/modals/components/form/SelectField.vue";
import StepperHeader from "@/ui/components/modals/components/ManageStepperHeader.vue";
import { Step, Stepper, StepperWindow } from "@/ui/components/modals/components/Stepper";
import { Validation } from "@/ui/mixins/validation";

/**
 * Scheme to create, modify a specific ML Model device.
 * Specified in the ML Model device type definition in store/mpc/mlModelTypes.ts
 */
export default defineComponent({
  components: {
    "v-combobox": VCombobox,
    ComboboxField,
    SelectField,
    DatePickerCustom,
    Step,
    Stepper,
    StepperWindow,
    FirstStepActions,
    SecondStepActions,
    FinalStepActions,
    StepperHeader,
  },
  mixins: [Validation],
  props: {
    deviceData: {
      default: () => ({
        name: "",
        data: {
          type: "",
          meta: {},
        },
        collection_id: "",
      }),
      type: Object as PropType<any>,
    },
    isEditModal: [Object, Boolean],
    activeRoomId: { default: "", type: String },
  },
  data() {
    const startDate: any = "";
    const additionalAreas: any = {};
    const additionalAreasKeys: any = [];
    const controllerMappingsLocal: any = {};
    const mlModel: any = null;

    return {
      stage: 1,
      mlModel,
      showOptionalFields: false,
      controllerMappingsLocal,
      additionalAreasKeys,
      additionalAreas,
      startDate,
    };
  },
  computed: {
    /** steps validation*/
    nameValidation() {
      return !!this.mlModel?.name?.length;
    },
    settingsValidation() {
      return !!this.mlModel.collection_id.length;
    },
    mlModelSchema() {
      return this.mlModelTypes[this.deviceData.data.type];
    },
    mlModelMappings() {
      return this.mlModelSchema.controllerMappings;
    },
    mappingsByColumns() {
      if (this.mlModel?.data?.type) {
        return this.mlModelSchema.mappingsByColumns;
      } else {
        return [];
      }
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
    /**
     * Checks mappings if they not valid
     * @return true if mapping filled, else false
     */
    mappingValidation() {
      if (this.stage === 2) {
        const optionalFields = Object.entries(this.mlModelMappings)
          .filter((field: any) => !field[1].optional)
          .map((field: any) => field[0]);
        const isOptionalFieldsFilled = optionalFields
          .map((el: any) => this.controllerMappingsLocal[el])
          .every((el: any) => el);
        return !!this.startDate && isOptionalFieldsFilled;
      } else {
        return false;
      }
    },
    mlModelTypes(): any {
      return this.$store.getters["mpc/mlModelTypes"];
    },
    rooms(): any {
      return this.$store.getters["rooms/rooms"];
    },
    project(): any {
      return (this.$store.state as RootState).projects.project;
    },
    measurementsKeys(): any {
      return this.$store.getters["measurements/measurementsKeys"];
    },
  },
  watch: {
    stage: [
      {
        handler: "onStageChange",
      },
    ],
  },
  async created() {
    this.mlModel = JSON.parse(JSON.stringify(this.deviceData));

    if (this.activeRoomId.length && !this.isEditModal)
      this.mlModel.collection_id = this.activeRoomId;

    // load mappings if create new ml model
    this.controllerMappingsLocal = this.initMappingsForDevice();

    // if edit device
    if (this.isEditModal) {
      // load current mappings
      this.controllerMappingsLocal = {
        ...this.controllerMappingsLocal,
        ...this.deviceData.data.meta.controllerMappings,
      };

      // load additional areas
      this.additionalAreasKeys = Object.keys(this.deviceData.data.meta.additionalAreas);
      this.additionalAreas = { ...this.deviceData.data.meta.additionalAreas };

      // load start date
      this.startDate = this.deviceData.data.meta.controllerMappings.startDate;
    }
  },
  methods: {
    /**
     * Clear date picker value on press button cancel on calendar
     */
    datePickerCustomClearDate() {
      this.startDate = this.deviceData.data.meta.controllerMappings.startDate || "";
    },
    /**
     * Init addition areas object
     * @param item key of additional area
     * @return object with prop additional area key and value empty string
     */
    initAdditionalAreasItem(item: string) {
      return { [item]: "" };
    },
    /**
     * Crates new additional areas field
     */
    addAdditionalArea() {
      const newItem = `item_${Date.now()}`;
      this.additionalAreasKeys.push(newItem);
      this.additionalAreas = { ...this.additionalAreas, ...this.initAdditionalAreasItem(newItem) };
    },
    /**
     * Removes selected additional areas field
     */
    removeAdditionalArea(key: string) {
      this.additionalAreasKeys = this.additionalAreasKeys.filter((item: any) => item !== key);
      delete this.additionalAreas[key];
    },
    /**
     * Checks incoming parameter and return list of measurements or some array according to parameter
     * @param key any type
     * @return if parameter array return this array else return list of measurements
     */
    listDefinition(key: any) {
      if (Array.isArray(key)) {
        return key;
      } else {
        return this.measurementsKeys;
      }
    },
    /**
     * Goes through the list and creates an option object for each item
     */
    initMappingsForDevice() {
      let mappingsSchema: any = {};
      Object.keys(this.mlModelMappings).forEach((item: string) => {
        mappingsSchema = { ...mappingsSchema, [item]: "" };
      });
      return mappingsSchema;
    },
    /**
     * Creates rules for Ml Model device according to errorWarning field,
     * save ids of created rules in current ML Model device object
     * @param deviceData current Ml Model data object
     */
    async addRulesWhenCreateDevice(deviceData: any) {
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
          actions: [{ type: "alert", params: { type: 2, body: "{{rule}} - Device has an Error" } }],
          created_at: "",
        },
      ];
      const res = await this.addRules({
        project_id: this.project.id,
        rulesList,
      });
      deviceData.data.meta.warningRule = res[0].id;
      deviceData.data.meta.errorRule = res[1].id;
    },
    /**
     * Replacing existing rules with new ones when errorWarning field is changed
     * @param deviceData current Ml Model data object
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
      if (oldErrorWarningVar !== newErrorWarningVar && newErrorWarningVar) {
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
        // create new rules
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
    },
    /**
     * Save Ml Model data in database
     */
    async sendForm() {
      const copy = JSON.parse(JSON.stringify(this.mlModel));

      copy.project_id = this.project.id;
      copy.data.meta.controllerMappings = this.controllerMappingsLocal;
      copy.data.meta.controllerMappings.startDate = this.startDate;
      copy.data.meta.additionalAreas = this.additionalAreas;

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
.hco-schema {
  height: 100%;

  .v-window {
    flex-grow: 1;

    .hide-optional {
      display: none;
    }

    .mapping-field {
    }

    .actions {
      display: flex;
      align-items: center;

      .stage2-actions {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .v-input--selection-controls {
          padding: 0 !important;
          margin: 0 !important;
        }
      }
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

  .mappings-title {
    height: 30px;
  }
}
</style>
