<!-- eslint-disable vuetify/no-deprecated-components -->
<template>
  <div class="energy-optimization-schema h-100">
    <Stepper v-model="stage">
      <StepperHeader :stage="stage" translation-sub-path="manageMLModel" />
      <StepperWindow>
        <Step :value="1">
          <template #content>
            <CoreContainer class="stage-1" fluid>
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
              <CoreRow>
                <CoreColumn offset-sm="3" sm="6">
                  <div v-for="(group, groupIndex) in groupsList" :key="`group-${groupIndex}`">
                    <div class="group-title">
                      {{
                        $t(`mlModel.${deviceData.data.type}.groups.${groups[group[0]].id}.title`)
                      }}
                    </div>
                    <div>
                      <div
                        v-for="(system, systemIndex) in group[1].systems"
                        :key="`system-${systemIndex}`"
                        class="d-flex justify-space-between align-center pb-2"
                      >
                        <div class="d-flex" style="width: 60%">
                          <div class="system-title" style="width: 80%">
                            {{
                              $t(
                                `mlModel.${deviceData.data.type}.systems.${systems[system].id}.title`,
                              )
                            }}
                          </div>
                          <div class="ml-2">
                            <CoreCheckbox
                              v-if="systems[system].required"
                              :model-value="true"
                              hide-details
                              @click.capture="cancelBaseAction($event)"
                            />
                            <CoreCheckbox
                              v-else
                              :model-value="systemsForm[system].count > 0"
                              hide-details
                              @click.capture="
                                handleSystemCountCheckbox({ ev: $event, system: system })
                              "
                            />
                          </div>
                        </div>
                        <div style="width: 40%">
                          <CoreSelect
                            v-model.lazy="systemsForm[system].count"
                            :items="getSystemQuantity.get(system)"
                            :label="$t('modals.manageMLModel.quantity')"
                            density="compact"
                            hide-details
                            item-props.color="accent"
                            @update:model-value="handleSystemCountSelect(system)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
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
            <div class="stage-2">
              <!-- headers -->
              <div class="mt-3 mx-3">
                <CoreRow>
                  <div class="d-flex flex-wrap justify-center w-100">
                    <CoreButtonToggle>
                      <div
                        v-for="(group, groupIndex) in currentGroupedSystemsListWithGeneralMappings"
                        :key="groupIndex"
                      >
                        <CoreBadge
                          :model-value="
                            group[0] === 'ems'
                              ? !emsGeneralMappingsValidation
                              : systemsByGroupsValidation.get(group[0]).unFilled
                          "
                          color="error"
                          dot
                          offset-x="10"
                          overlap
                        >
                          <NavigationTab
                            :is-active="currentGroup === group[0]"
                            :tab-title="
                              group[0] === 'ems'
                                ? $t(`mlModel.${deviceData.data.type}.ems`)
                                : $t(`mlModel.${deviceData.data.type}.systems.${group[0]}.title`)
                            "
                            @click="
                              handleCurrentSystem({
                                group: group[0],
                                systemGroup: group[1],
                                system: group[1].length > 0 ? group[1][0] : null,
                              })
                            "
                          />
                        </CoreBadge>
                      </div>
                    </CoreButtonToggle>
                  </div>
                </CoreRow>
                <CoreRow>
                  <CoreTabs v-model="systemTab">
                    <CoreTab
                      v-for="(system, systemIndex) in currentSystemGroup"
                      :key="systemIndex"
                      :value="systemIndex"
                      :class="{
                        'system-unfilled': systemsByGroupsValidation
                          .get(currentGroup)
                          .instances.get(system),
                      }"
                      @click="
                        handleCurrentSystem({
                          group: currentGroup,
                          systemGroup: currentSystemGroup,
                          system,
                        })
                      "
                    >
                      {{ $t(`mlModel.${deviceData.data.type}.systems.${currentGroup}.title`) }}
                      {{ systemIndex + 1 }}
                    </CoreTab>
                  </CoreTabs>
                </CoreRow>
              </div>
              <!-- Content for second step called mapping-->
              <div v-if="stage === 2">
                <!-- EMS mapping -->
                <template v-if="currentGroup === 'ems'">
                  <CoreContainer fluid>
                    <CoreRow>
                      <!-- input mappings -->
                      <CoreColumn :cols="$vuetify.display.mobile ? 12 : 6">
                        <!-- Column Titel -->
                        <div class="mappings-title">Input</div>
                        <!-- Column Wrapper -->
                        <div>
                          <!-- Column Input Items -->
                          <div
                            v-for="(input, inputIndex) in mappingsByColumns.inputMappings"
                            :key="inputIndex"
                            class="mt-2"
                          >
                            <div
                              :class="{
                                'hide-optional':
                                  !showOptionalFields && mlModelMappings[input].optional,
                              }"
                            >
                              <div class="optional mb-2">
                                <span v-if="mlModelMappings[input].optional">optional</span>
                              </div>
                              <component
                                :is="mlModelMappings[input].vuetifyComponent"
                                v-model="controllerMainMappingsLocal[input]"
                                :items="measurementsKeys"
                                :label="
                                  $t(
                                    `mlModel.${mlModel.data.type}.controllerMappings.${input}.label`,
                                  )
                                "
                                :optional="mlModelMappings[input].optional"
                                @date-picker-custom-clear-date="datePickerCustomClearDate(input)"
                              />
                              <div class="description">
                                {{
                                  $t(
                                    `mlModel.${mlModel.data.type}.controllerMappings.${input}.description`,
                                  )
                                }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CoreColumn>
                      <!-- Output mapping -->
                      <CoreColumn :cols="$vuetify.display.mobile ? 12 : 6">
                        <div class="mappings-title">Output</div>
                        <div>
                          <div
                            v-for="(output, outputIndex) in mappingsByColumns.outputMappings"
                            :key="outputIndex"
                            class="mt-2"
                          >
                            <div
                              v-if="!mlModelMappings[output].isDynamic"
                              :class="{
                                'hide-optional':
                                  !showOptionalFields && mlModelMappings[output].optional,
                              }"
                            >
                              <div class="optional mb-2">
                                <span v-if="mlModelMappings[output].optional">optional</span>
                              </div>
                              <component
                                :is="mlModelMappings[output].vuetifyComponent"
                                v-model="controllerMainMappingsLocal[output]"
                                :items="measurementsKeys"
                                :label="
                                  $t(
                                    `mlModel.${mlModel.data.type}.controllerMappings.${output}.label`,
                                  )
                                "
                                :optional="mlModelMappings[output].optional"
                              />
                              <div class="description">
                                {{
                                  $t(
                                    `mlModel.${mlModel.data.type}.controllerMappings.${output}.description`,
                                  )
                                }}
                              </div>
                            </div>
                            <div v-else>
                              <DynamicField
                                v-model="controllerMainMappingsLocal[output]"
                                :instance-label-path="`mlModel.${mlModel.data.type}.controllerMappings.${output}.label`"
                                :items-list="measurementsKeys"
                                :label="
                                  $t(
                                    `mlModel.${mlModel.data.type}.controllerMappings.${output}.label`,
                                  )
                                "
                                :max-number-of-fields="mlModelMappings[output].maxRange"
                              />
                            </div>
                          </div>
                        </div>
                      </CoreColumn>
                    </CoreRow>
                  </CoreContainer>
                </template>
                <!-- Systems mapping -->
                <template v-else>
                  <CoreContainer fluid>
                    <!-- System mapping -->
                    <CoreRow>
                      <!-- input column -->
                      <CoreColumn
                        v-if="systems[currentGroup].mappingsByColumns.input.length > 0"
                        :cols="$vuetify.display.mobile ? 12 : 4"
                      >
                        <div class="mappings-title">Input</div>
                        <div
                          v-for="(input, inputIndex) in systems[currentGroup].mappingsByColumns
                            .input"
                          :key="inputIndex"
                          class="mt-2"
                        >
                          <div v-if="!systems[currentGroup].mappings[input].isDynamic">
                            <div
                              :class="{
                                'hide-optional':
                                  !showOptionalFields &&
                                  systems[currentGroup].mappings[input].optional,
                              }"
                            >
                              <div class="optional mb-2">
                                <span v-if="systems[currentGroup].mappings[input].optional"
                                  >optional</span
                                >
                              </div>
                              <ComboboxField
                                v-model="systemsForm[currentGroup].components[currentSystem][input]"
                                :disabled="
                                  errorVariableValidation(currentGroup, currentSystem, input)
                                "
                                :items="measurementsKeys"
                                :label="
                                  $t(
                                    `mlModel.${mlModel.data.type}.systems.${currentGroup}.mappings.${input}.label`,
                                  )
                                "
                                :optional="systems[currentGroup].mappings[input].optional"
                              />
                              <div class="description">
                                {{
                                  $t(
                                    `mlModel.${mlModel.data.type}.systems.${currentGroup}.mappings.${input}.description`,
                                  )
                                }}
                              </div>
                            </div>
                          </div>
                          <div v-else>
                            <div
                              :class="{
                                'hide-optional':
                                  !showOptionalFields &&
                                  systems[currentGroup].mappings[input].optional,
                              }"
                            >
                              <component
                                :is="systems[currentGroup].mappings[input].vuetifyComponent"
                                v-model="systemsForm[currentGroup].components[currentSystem][input]"
                                :instance-label-path="`mlModel.${mlModel.data.type}.systems.${currentGroup}.mappings.${input}.instanceLabel`"
                                :is-optional="systems[currentGroup].mappings[input].optional"
                                :items-list="measurementsKeys"
                                :label="
                                  $t(
                                    `mlModel.${mlModel.data.type}.systems.${currentGroup}.mappings.${input}.label`,
                                  )
                                "
                                :max-number-of-fields="
                                  systems[currentGroup].mappings[input].maxRange
                                "
                              />
                            </div>
                          </div>
                        </div>
                      </CoreColumn>
                      <!-- output column -->
                      <CoreColumn
                        v-if="systems[currentGroup].mappingsByColumns.output.length > 0"
                        :cols="$vuetify.display.mobile ? 12 : 4"
                      >
                        <div class="mappings-title">Output</div>
                        <div
                          v-for="(output, outputIndex) in systems[currentGroup].mappingsByColumns
                            .output"
                          :key="outputIndex"
                          class="mt-2"
                        >
                          <div v-if="!systems[currentGroup].mappings[output].isDynamic">
                            <div
                              :class="{
                                'hide-optional':
                                  !showOptionalFields &&
                                  systems[currentGroup].mappings[output].optional,
                              }"
                            >
                              <div class="optional mb-2">
                                <span v-if="systems[currentGroup].mappings[output].optional"
                                  >optional</span
                                >
                              </div>
                              <ComboboxField
                                v-model="
                                  systemsForm[currentGroup].components[currentSystem][output]
                                "
                                :items="measurementsKeys"
                                :label="
                                  $t(
                                    `mlModel.${mlModel.data.type}.systems.${currentGroup}.mappings.${output}.label`,
                                  )
                                "
                                :optional="systems[currentGroup].mappings[output].optional"
                              />
                              <div class="description">
                                {{
                                  $t(
                                    `mlModel.${mlModel.data.type}.systems.${currentGroup}.mappings.${output}.description`,
                                  )
                                }}
                              </div>
                            </div>
                          </div>
                          <!-- dynamic fields -->
                          <div v-else>
                            <div
                              :class="{
                                'hide-optional':
                                  !showOptionalFields &&
                                  systems[currentGroup].mappings[output].optional,
                              }"
                            >
                              <component
                                :is="systems[currentGroup].mappings[output].vuetifyComponent"
                                v-model="
                                  systemsForm[currentGroup].components[currentSystem][output]
                                "
                                :instance-label-path="`mlModel.${mlModel.data.type}.systems.${currentGroup}.mappings.${output}.instanceLabel`"
                                :is-optional="systems[currentGroup].mappings[output].optional"
                                :items-list="measurementsKeys"
                                :label="
                                  $t(
                                    `mlModel.${mlModel.data.type}.systems.${currentGroup}.mappings.${output}.label`,
                                  )
                                "
                                :max-number-of-fields="
                                  systems[currentGroup].mappings[output].maxRange
                                "
                              />
                            </div>
                          </div>
                        </div>
                      </CoreColumn>
                      <!-- Title mapping -->
                      <CoreColumn
                        v-if="systems[currentGroup].mappingsByColumns.titles.length > 0"
                        :cols="$vuetify.display.mobile ? 12 : 4"
                      >
                        <div class="mappings-title">Titles</div>
                        <div
                          v-for="(titles, titlesIndex) in systems[currentGroup].mappingsByColumns
                            .titles"
                          :key="titlesIndex"
                          class="mt-2"
                        >
                          <div class="optional mb-2" />
                          <TextField
                            v-model="systemsForm[currentGroup].components[currentSystem][titles]"
                            :label="
                              $t(
                                `mlModel.${mlModel.data.type}.systems.${currentGroup}.mappings.${titles}.label`,
                              )
                            "
                            :max-length="30"
                            :optional="false"
                          />
                          <div class="description" />
                        </div>
                      </CoreColumn>
                    </CoreRow>
                  </CoreContainer>
                </template>
              </div>
            </div>
          </template>
          <template #footer>
            <SecondStepActions
              v-model="showOptionalFields"
              :disable-next-button="!mappingValidation"
              :next-button-tool-tip="$t('modals.manageMLModel.tooltips.requiredFields')"
              :hide-next-tool-tip="mappingValidation"
              :with-optionals="isOptionalFieldsInMappings"
              @back="stage = 1"
              @next="stage = 3"
            />
          </template>
        </Step>

        <Step :value="3">
          <template #content>
            <div class="content stage-3">
              <div v-if="updatingDeviceProcess" class="updating-process-placeholder">
                <CircleSpinner :size="40" color="accent" />
              </div>
              <CoreContainer fluid>
                <CoreRow>
                  <CoreColumn offset-sm="4" sm="4">
                    <div>
                      <CoreSelect
                        v-model="mlModel.collection_id"
                        :items="sortedRooms"
                        :label="$t('modals.manageMLModel.form.areas')"
                        hide-details
                        hide-selected
                        item-title="name"
                        item-value="id"
                      />
                    </div>
                    <component
                      :is="mlModelAdditionalFields.component"
                      v-if="mlModelAdditionalFields"
                      v-model="additionalFields"
                      class="mt-4"
                    />
                  </CoreColumn>
                </CoreRow>
              </CoreContainer>
            </div>
          </template>
          <template #footer>
            <FinalStepActions
              :disable-next-button="!settingsValidation || updatingDeviceProcess"
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
import { VCombobox, VSelect } from "vuetify/components";

import { RootState } from "@/store/types";
import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import {
  FinalStepActions,
  FirstStepActions,
  SecondStepActions,
} from "@/ui/components/modals/components/Actions";
import DatePickerCustom from "@/ui/components/modals/components/DatePickerCustom.vue";
import DynamicField from "@/ui/components/modals/components/DynamicField.vue";
import DynamicFieldWithTitle from "@/ui/components/modals/components/DynamicFieldWithTitle.vue";
import ComboboxField from "@/ui/components/modals/components/form/ComboboxField.vue";
import TextField from "@/ui/components/modals/components/form/TextField.vue";
import InputFieldNumber from "@/ui/components/modals/components/InputFieldNumber.vue";
import StepperHeader from "@/ui/components/modals/components/ManageStepperHeader.vue";
import NavigationTab from "@/ui/components/modals/components/NavigationTab.vue";
import { Step, Stepper, StepperWindow } from "@/ui/components/modals/components/Stepper";
import EMSAdditionalFields from "@/ui/components/modals/ManageMLModel/components/EMSAdditionalFields.vue";
import { Validation } from "@/ui/mixins/validation";

/**
 * Scheme to create, modify a specific ML Model device.
 * Specified in the ML Model device type definition in store/mpc/mlModelTypes.ts
 */
export default defineComponent({
  components: {
    ComboboxField,
    TextField,
    "v-combobox": VCombobox,
    "v-select": VSelect,
    InputFieldNumber,
    CircleSpinner,
    DatePickerCustom,
    NavigationTab,
    DynamicField,
    EMSAdditionalFields,
    DynamicFieldWithTitle,
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
    const additionalFields: any = {};
    const controllerMainMappingsLocal: any = {};
    const systemsForm: any = {};
    const copyOfSystemsForValidationError: any = null;
    const currentSystemGroup: any[] = [];
    const currentSystem: any = null;
    const mlModel: any = null;

    return {
      stage: 1,
      mlModel,
      /** need for checkbox which show or hide optional fields */
      showOptionalFields: false,
      /** prop responds for block modal when updating ems (rules, fields ...) */
      updatingDeviceProcess: false,
      currentGroup: "ems",
      currentSystem,
      currentSystemGroup,
      systemTab: 0,
      copyOfSystemsForValidationError,
      enableElectricTariff: false,
      /** local dynamic forms */
      systemsForm,
      controllerMainMappingsLocal,
      additionalFields,
    };
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    rulesState() {
      return (this.$store.state as RootState).rules;
    },
    measurementsKeys() {
      return this.measurementsState.measurementsKeys;
    },
    rulesList() {
      return this.rulesState.rules;
    },
    rulesListIds() {
      return this.rulesList.map((rule: any) => rule.id);
    },
    /** step 1     */
    nameValidation() {
      return !!this.mlModel?.name?.length && !!this.currentSystemsListFiltered?.length;
    },
    /**
     * Checks general EMS mappings
     * @return true if general mappings valid, else false
     */
    emsGeneralMappingsValidation() {
      if (this.stage === 2) {
        // get all required mappings keys
        const requiredFieldsMainMappings = Object.entries(this.mlModelMappings)
          .filter((field: any) => !field[1].optional)
          .map((field: any) => field[0]);
        return requiredFieldsMainMappings
          .map((el: any) => {
            const mapping = this.controllerMainMappingsLocal[el];
            if (mapping && typeof mapping === "object") {
              // checks all values if mapping is object
              return Object.values(mapping).every((el: any) => el.length);
            } else {
              return mapping;
            }
          })
          .every((el: any) => el);
      } else {
        return null;
      }
    },
    /**
     * Combines systems by group. Creates Map collection width all group validation status
     * and group instances statuses.
     * @return Map collection with status of validation for every system of EMS
     */
    systemsByGroupsValidation() {
      const res: any = this.currentGroupedSystemsList.map((system: any) => {
        const systemName: string = system[0];
        const systemInstances: string[] = system[1];
        // define all required fields of system
        const requiredFields: any = Object.entries(this.systems[system[0]].mappings)
          .filter((mapping: any) => {
            const isOptional = mapping[1].optional;
            return !isOptional;
          })
          .map((mapping: any) => mapping[0]);

        // create array of systems key, fields validation status
        const systemInstancesWithMappings: any = systemInstances.map((instance: any) => {
          const fieldsValues = requiredFields.map((field: any) => {
            const mapping = this.systemsForm[systemName].components[instance][field];
            if (typeof mapping === "object") {
              const arr: any = Object.values(mapping).map((el: any) => {
                return typeof el === "object" ? !!el.variable.length : !!el.length;
              });
              return arr.every((el: any) => el);
            } else {
              return !!mapping.length;
            }
          });
          return [instance, fieldsValues.some((el: any) => !el)];
        });
        const allInstances: any = systemInstancesWithMappings
          .map((el: any) => el[1])
          .some((el: any) => el);
        return [
          system[0],
          {
            instances: new Map(systemInstancesWithMappings),
            unFilled: allInstances,
          },
        ];
      });
      return new Map(res);
    },
    /**
     * Checks systems groups validation statuses
     * @return boolean, system group validation status
     */
    systemsValidation() {
      const arr: any = Array.from(this.systemsByGroupsValidation.values()).map(
        (el: any) => el.unFilled,
      );
      return !arr.some((el: any) => el);
    },
    /**
     * Combined validation of all mappings in stage 2
     * @return boolean, status of stage 2 validation
     */
    mappingValidation() {
      if (this.stage === 2) {
        return this.emsGeneralMappingsValidation && this.systemsValidation;
      }
      return true;
    },
    /**
     * Combined validation of ML Model collection_id field and additional fields
     * @return boolean, status of stage 3 validation
     */
    settingsValidation() {
      if (this.mlModelAdditionalFields?.objects) {
        const arr2dValues = Object.values(this.additionalFields).map((el: any) =>
          Object.values(el),
        );
        const flat = arr2dValues.flat();
        const isFilled = !flat.some((el: any) => typeof el !== "number");
        return !!this.mlModel.collection_id.length && isFilled;
      }
      return !!this.mlModel.collection_id.length;
    },
    /**
     * Sort the list of rooms by number in name and alphabetically
     * TODO: create sortedRoomsList getter in store/rooms
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
    /** define current EMS instance mappings, other settings */
    mlModelSchema() {
      return this.mlModelTypes[this.deviceData.data.type];
    },
    mlModelMappings() {
      return this.mlModelSchema.controllerMappings;
    },
    mlModelAdditionalFields() {
      return this.mlModelSchema.additionalFields;
    },
    mappingsByColumns() {
      return this.mlModelSchema.mappingsByColumns;
    },
    groups() {
      return this.mlModelSchema.groups;
    },
    systems() {
      return this.mlModelSchema.systems;
    },

    /**
     * Checks if EMS has optional general mappings
     * @return boolean, status of all general optional mappings
     */
    isGeneralOptionalMappings() {
      return Object.values(this.mlModelMappings)
        .map((el: any) => el.optional)
        .some((el: boolean) => el);
    },
    /**
     * Checks if some system has optional mappings fields
     * @return boolean, true if system has optional mapping
     */
    isSystemsOptionalMappings() {
      const systems = this.currentGroupedSystemsList.length
        ? this.currentGroupedSystemsList.map((el: any) => el[0])
        : [];
      return systems
        .map((el: string) => {
          const systemOptions = this.systems[el];
          return Object.values(systemOptions.mappings)
            .map((map: any) => map.optional)
            .some((el: boolean) => el);
        })
        .some((el: boolean) => el);
    },
    /**
     * Combine EMS general mappings status and EMS systems mappings status
     * @return boolean, true if EMS has any optional mappings
     */
    isOptionalFieldsInMappings() {
      return this.isSystemsOptionalMappings || this.isGeneralOptionalMappings;
    },
    /**
     * Getter filter current systems by error fields. Needs for creating rules
     */
    filteredSystemsByErrorWarning() {
      const systems: any = Object.entries(this.systemsForm).filter((el: any) => el[1].count);
      const systemsInstances: any = systems
        .map((system: any) =>
          Object.entries(system[1].components)
            .map((el: any) => [el[0], el[1].error])
            .filter((inst: any) => inst[1]),
        )
        .reduce((acc: any, item: any) => acc.concat(item), []);
      return systemsInstances;
    },
    groupsList() {
      return Object.entries(this.groups);
    },
    /** logic responsible for groups, systems lists */
    groupOfSystemsList() {
      return Object.keys(this.systemsForm);
    },
    currentSystemsListFiltered() {
      return Object.entries(this.systemsForm).filter(
        (system: any) => Object.keys(system[1].components).length,
      );
    },
    currentGroupedSystemsList() {
      return this.currentSystemsListFiltered.map((group: any) => [
        group[0],
        Object.keys(group[1].components),
      ]);
    },
    currentGroupedSystemsListWithGeneralMappings() {
      return [...[["ems", []]], ...this.currentGroupedSystemsList];
    },
    /**
     * Converts systems instances quantity to array
     * @return Map collection of systems and array(number of system instances)
     */
    getSystemQuantity() {
      const systemsArr: any = Object.entries(this.systems).map((system: any) => {
        const systemName: string = system[0];
        const systemQuantity: number[] = Array.from(
          { length: system[1].quantity },
          (_, i) => i + 1,
        );
        return [systemName, systemQuantity];
      });
      return new Map(systemsArr);
    },
    project(): any {
      return (this.$store.state as RootState).projects.project;
    },
    rooms(): any {
      return this.$store.getters["rooms/rooms"];
    },
    mlModelTypes(): any {
      return this.$store.getters["mpc/mlModelTypes"];
    },
  },
  watch: {
    stage: [
      {
        handler: "onStageChange",
      },
    ],
    currentGroup: [
      {
        handler: "handleSystemGroupChange",
      },
    ],
  },
  async created() {
    this.initSystemsFormStructure();
    this.mlModel = JSON.parse(JSON.stringify(this.deviceData));

    if (this.activeRoomId.length && !this.isEditModal)
      this.mlModel.collection_id = this.activeRoomId;

    this.controllerMainMappingsLocal = this.initMainMappings();

    // init fields in stage 3
    this.initAdditionalFields();

    if (this.isEditModal) {
      this.initSystemsFormWhenEditDevice();
      this.loadMainMappings();
    } else {
      this.initSystemsFormWhenNewDevice();
    }

    await this.loadRules(this.$route.params.id as string);
  },
  methods: {
    /**
     * Validation for every error field in systems.
     * Need to avoid create/delete rules when edit EMS
     * @param system system key
     * @param systemInstance system instance key
     * @param mappingKey system instance mapping key
     */
    errorVariableValidation(system: string, systemInstance: string, mappingKey: string) {
      if (this.isEditModal && mappingKey === "error") {
        const copyOfCurrentWhenGoFromStageOne =
          this.copyOfSystemsForValidationError[system].components?.[systemInstance]?.error;
        const current = this.systemsForm[system].components?.[systemInstance]?.error;
        const old =
          this.deviceData.data.meta.controllerMappings[system].components?.[systemInstance]?.error;

        const { rules } = this.mlModel.data.meta;
        const rulesBySystem: undefined | { errorRule: string; warningRule: string } =
          rules[systemInstance];
        const checkIfRulesForSystemWasDeleted = () => {
          if (rulesBySystem) {
            const warning: undefined | string = rulesBySystem.warningRule;
            const error: undefined | string = rulesBySystem.errorRule;
            const isWarningRuleExist = warning
              ? this.rulesListIds.some((ruleId: string) => ruleId === warning)
              : null;
            const isErrorRuleExist = error
              ? this.rulesListIds.some((ruleId: string) => ruleId === error)
              : null;
            return !isErrorRuleExist || !isWarningRuleExist;
          }
          return false;
        };
        // get unblock when some of props = false
        return (
          copyOfCurrentWhenGoFromStageOne === old &&
          copyOfCurrentWhenGoFromStageOne === current &&
          !!old.length &&
          checkIfRulesForSystemWasDeleted()
        );
      }
      return false;
    },
    /**
     * Init local EMS systems form
     */
    initSystemsFormStructure() {
      const list = Object.keys(this.systems);
      list.forEach((system: string) => {
        const count = +this.systems[system].required;
        this.systemsForm = { ...this.systemsForm, ...{ [system]: { components: {}, count } } };
      });
    },
    /**
     * Going through device additional fields and create options for it.
     * Additional fields placed in ML Model types definition store/mpc/mlModelTypes.ts
     */
    initAdditionalFields() {
      if (this.mlModelAdditionalFields) {
        const objectsKeys = Object.keys(this.mlModelAdditionalFields.objects);
        objectsKeys.forEach((obj: string) => {
          if (this.isEditModal) {
            this.additionalFields = {
              ...this.additionalFields,
              ...{ [obj]: { ...this.mlModel.data.meta[obj] } },
            };
          } else {
            const props = this.mlModelAdditionalFields.objects[obj];
            let propsObj = {};
            props.forEach((prop: string) => {
              propsObj = { ...propsObj, ...{ [prop]: "" } };
            });
            this.additionalFields = {
              ...this.additionalFields,
              ...{ [obj]: { ...propsObj } },
            };
          }
        });
      }
    },
    /**
     * Goes through the system mappings and creates an option object for each
     * @param groupName system groups name
     * @return system mappings form object
     */
    defineMappingsForSystem(groupName: any) {
      if (this.systems[groupName].isDynamicFields) {
        const form = { ...this.systems[groupName].initMappings };
        const mappingsList = Object.entries(this.systems[groupName].mappings);
        const dynamicMappings = mappingsList.filter((mapping: any) => mapping[1].isDynamic);
        dynamicMappings.forEach((mapping: any) => {
          if (mapping[1].vuetifyComponent === "DynamicFieldWithTitle") {
            form[mapping[0]] = {
              [`mp-${Date.now()}`]: {
                variable: "",
                title: "",
              },
            };
          } else {
            form[mapping[0]] = { [`mp-${Date.now()}`]: "" };
          }
        });
        return form;
      } else {
        return { ...this.systems[groupName].initMappings };
      }
    },
    /**
     * Creates instances for system according to selected system quantity
     */
    initSystemsFormWhenNewDevice() {
      this.groupOfSystemsList.forEach((system: any) => {
        const arrOfSystemsInstances = Array.from(
          { length: this.systemsForm[system].count },
          (_, i) => i + 1,
        ).map((index) => `${system}${index}`);

        let systemsFormLocal = {};
        arrOfSystemsInstances.forEach((systemInstance: any) => {
          systemsFormLocal = {
            ...systemsFormLocal,
            ...{ [systemInstance]: this.defineMappingsForSystem(system) },
          };
        });
        this.systemsForm[system].components = systemsFormLocal;
      });
    },
    /**
     * Init EMS general mappings form
     * @return general mappings form of EMS
     */
    initMainMappings() {
      let mappingsSchema: any = {};
      Object.keys(this.mlModelMappings).forEach((item: string) => {
        const { isDynamic } = this.mlModelMappings[item];
        const form: any = { [item]: { [`mp-${Date.now()}`]: "" } };
        const mapping: any = isDynamic ? form : { [item]: "" };
        mappingsSchema = { ...mappingsSchema, ...mapping };
      });
      return mappingsSchema;
    },
    /**
     * Init local systemsForm object when edit EMS device
     */
    initSystemsFormWhenEditDevice() {
      const { controllerMappings } = JSON.parse(JSON.stringify(this.deviceData.data.meta));
      const systemsList = Object.keys(this.systems);
      systemsList.forEach((system: any) => {
        this.systemsForm[system] = { ...controllerMappings[system] };
      });
    },
    /**
     * Init local controllerMainMappingsLocal object
     */
    loadMainMappings() {
      const { controllerMappings } = this.deviceData.data.meta;
      const emsMappingsList = Object.keys(this.mlModelMappings);
      emsMappingsList.forEach((mapping: any) => {
        this.controllerMainMappingsLocal[mapping] = controllerMappings[mapping];
      });
    },
    /** stage 1 function responsible for add, remove systems in systems groups */
    cancelBaseAction(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
    },
    /**
     * Managing the number of systems by checkbox.
     * If the checkbox is disabled the number of systems is 0.
     * @param ev event
     * @param system current system key
     */
    handleSystemCountCheckbox({ ev, system }: any) {
      ev.preventDefault();
      ev.stopPropagation();
      this.systemsForm[system].count = this.systemsForm[system].count ? 0 : 1;

      const arrOfSystemsInstances = Array.from(
        { length: this.systemsForm[system].count },
        (_, i) => i + 1,
      ).map((index) => `${system}${index}`);

      let systemsFormLocal = {};
      arrOfSystemsInstances.forEach((systemInstance: any) => {
        systemsFormLocal = {
          ...systemsFormLocal,
          ...{ [systemInstance]: this.defineMappingsForSystem(system) },
        };
      });
      this.systemsForm[system].components = systemsFormLocal;
    },
    /**
     * Managing the number of systems by select.
     * @param system current system key
     */
    handleSystemCountSelect(system: any) {
      // define and add names for systems instances
      const arrOfSystems = Array.from(
        { length: this.systemsForm[system].count },
        (_, i) => i + 1,
      ).map((index) => `${system}${index}`);

      // create form by array of systems names
      let systemsFormLocal = {};
      arrOfSystems.forEach((systemName: any) => {
        systemsFormLocal = {
          ...systemsFormLocal,
          ...{ [systemName]: this.defineMappingsForSystem(system) },
        };
      });

      // logic responsible for correct merging new system instances
      const currentLength = this.systemsForm[system].count;
      const prevLength = Object.keys(this.systemsForm[system].components).length;
      // correct merge if current count of system less than previous count
      if (currentLength < prevLength) {
        Object.keys(this.systemsForm[system].components).forEach((item, index) => {
          if (index >= currentLength) {
            delete this.systemsForm[system].components[item];
          }
        });
        // correct merge if current count of system more than previous count
      } else {
        this.systemsForm[system].components = {
          ...systemsFormLocal,
          ...this.systemsForm[system].components,
        };
      }
    },
    /** set current system */
    handleCurrentSystem(data: { group: any; systemGroup: any; system: any }) {
      this.currentSystem = data.system ?? "ems";
      this.currentGroup = data.group;
      this.currentSystemGroup = data.systemGroup ?? [];
    },
    defineSystemNumber(system: any) {
      return system ? system.replace(/\D/g, "") : "0";
    },
    /**
     * Clear date picker value on press button cancel on calendar
     * @param formField form field key
     */
    datePickerCustomClearDate(formField: any) {
      this.controllerMainMappingsLocal[formField] =
        this.deviceData.data.meta.controllerMappings.startDate || "";
    },
    /**
     * Creates general rules for Ml Model device according to errorWarning field.
     * Creates systems rules for Ml Model device according to error field.
     * @param emsData current Ml Model data object
     */
    async addRulesWhenCreateEMS(emsData: any) {
      emsData.data.meta.rules = {};
      const warningRulesSystemList: any = this.filteredSystemsByErrorWarning.map((el: any) => {
        return {
          id: "",
          name: `${emsData.name}_${el[0]} Warning Rule`,
          active: true,
          timeout: 1,
          conditions: [
            {
              variable: el[1],
              and_or: false,
              condition: "equals",
              target: 1,
            },
          ],
          actions: [
            { type: "alert", params: { type: 1, body: "{{rule}} - Device has a Warning" } },
          ],
          created_at: "",
        };
      });
      const errorRulesSystemList: any = this.filteredSystemsByErrorWarning.map((el: any) => {
        return {
          id: "",
          name: `${emsData.name}_${el[0]} Error Rule`,
          active: true,
          timeout: 1,
          conditions: [
            {
              variable: el[1],
              and_or: false,
              condition: "equals",
              target: 2,
            },
          ],
          actions: [{ type: "alert", params: { type: 2, body: "{{rule}} - Device has an Error" } }],
          created_at: "",
        };
      });
      // ems general rules
      const generalRules: any = [
        {
          id: "",
          name: `${emsData.name} Warning Rule`,
          active: true,
          timeout: 1,
          conditions: [
            {
              variable: emsData.data.meta.controllerMappings.errorWarning,
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
          name: `${emsData.name} Error Rule`,
          active: true,
          timeout: 1,
          conditions: [
            {
              variable: emsData.data.meta.controllerMappings.errorWarning,
              and_or: false,
              condition: "equals",
              target: 2,
            },
          ],
          actions: [{ type: "alert", params: { type: 2, body: "{{rule}} - Device has an Error" } }],
          created_at: "",
        },
      ];
      // merging all rules obj in one array
      const allRulesList: any =
        emsData.data.type === "EMS"
          ? [...generalRules, ...warningRulesSystemList, ...errorRulesSystemList]
          : [...generalRules];
      // request
      const responseRulesList = await this.addRules({
        project_id: this.project.id,
        rulesList: allRulesList,
      });
      const resRules: any = responseRulesList.map((rule: any) => ({ [rule.name]: rule.id }));
      // set systems rules in copy.data.meta.rules
      this.filteredSystemsByErrorWarning.forEach((el: any) => {
        const warningRuleObj: any = resRules.find(
          (rule: any) => rule[`${emsData.name}_${el[0]} Warning Rule`],
        );
        const errorRuleObj: any = resRules.find(
          (rule: any) => rule[`${emsData.name}_${el[0]} Error Rule`],
        );
        emsData.data.meta.rules = {
          ...emsData.data.meta.rules,
          [el[0]]: {
            warningRule: warningRuleObj[`${emsData.name}_${el[0]} Warning Rule`],
            errorRule: errorRuleObj[`${emsData.name}_${el[0]} Error Rule`],
          },
        };
      });
      // set general ems rules in copy.meta
      const getWarningRule = () => {
        const warningRuleObj: any = resRules.find(
          (rule: any) => rule[`${emsData.name} Warning Rule`],
        );
        return warningRuleObj[`${emsData.name} Warning Rule`];
      };
      const getErrorRule = () => {
        const errorRuleObj: any = resRules.find((rule: any) => rule[`${emsData.name} Error Rule`]);
        return errorRuleObj[`${emsData.name} Error Rule`];
      };
      emsData.data.meta.warningRule = getWarningRule();
      emsData.data.meta.errorRule = getErrorRule();
    },
    /**
     * Replacing existing general rules with new ones when errorWarning field is changed
     * @param emsData current Ml Model data object
     */
    async generalRulesWhenUpdateEMS(emsData: any) {
      const oldErrorWarningVar = this.deviceData.data.meta.controllerMappings.errorWarning;
      const newErrorWarningVar = emsData.data.meta.controllerMappings.errorWarning;

      // if general error value was deleted
      if (oldErrorWarningVar && !newErrorWarningVar) {
        await Promise.all([
          this.deleteRule({
            project_id: this.project.id,
            rule_id: emsData.data.meta.warningRule,
          }),
          this.deleteRule({
            project_id: this.project.id,
            rule_id: emsData.data.meta.errorRule,
          }),
        ]);
      }
      // if errorWarning was changed
      if (oldErrorWarningVar !== newErrorWarningVar) {
        // delete old rules
        await Promise.all([
          this.deleteRule({
            project_id: this.project.id,
            rule_id: emsData.data.meta.warningRule,
          }),
          this.deleteRule({
            project_id: this.project.id,
            rule_id: emsData.data.meta.errorRule,
          }),
        ]);
        const rulesList: any = [
          {
            id: "",
            name: `${emsData.name} Warning Rule`,
            active: true,
            timeout: 1,
            conditions: [
              {
                variable: emsData.data.meta.controllerMappings.errorWarning,
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
            name: `${emsData.name} Error Rule`,
            active: true,
            timeout: 1,
            conditions: [
              {
                variable: emsData.data.meta.controllerMappings.errorWarning,
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
            (rule: any) => rule.name === `${emsData.name} Warning Rule`,
          );
          return warningRuleObj.id;
        };
        const getErrorRule = () => {
          const errorRuleObj: any = res.find(
            (rule: any) => rule.name === `${emsData.name} Error Rule`,
          );
          return errorRuleObj.id;
        };
        emsData.data.meta.warningRule = getWarningRule();
        emsData.data.meta.errorRule = getErrorRule();
      }
    },
    /**
     * Replacing existing systems rules with new ones when error field is changed
     * @param emsData current Ml Model data object
     */
    async addSystemRulesWhenUpdateEMS(emsData: any) {
      // define systems
      const {
        pv,
        generator,
        grid,
        battery,
        house,
        charge_station,
        electric_heating,
        heating_pump,
        big_consumer,
      } = this.deviceData.data.meta.controllerMappings;
      const old: any = {
        pv,
        generator,
        grid,
        battery,
        house,
        charge_station,
        electric_heating,
        heating_pump,
        big_consumer,
      };
      const oldArr: any = Object.values(old)
        .filter((system: any) => system.count)
        .map((system: any) =>
          Object.entries(system.components).map((systemInstance: any) => [
            systemInstance[0],
            systemInstance[1].error,
          ]),
        )
        .reduce((acc: any, el: any) => acc.concat(el), []);
      const current: any = this.systemsForm;
      const currentArr = Object.values(this.systemsForm)
        .filter((system: any) => system.count)
        .map((system: any) =>
          Object.entries(system.components).map((systemInstance: any) => [
            systemInstance[0],
            systemInstance[1].error,
          ]),
        )
        .reduce((acc: any, el: any) => acc.concat(el), []);

      let copyOfEMSRules = JSON.parse(JSON.stringify(emsData.data.meta.rules));
      // ==== delete old rules
      let oldItemsToDelete: any = oldArr.filter((oldItem: any) => {
        const targ: any =
          currentArr.find((currentItem: any) => currentItem[0] === oldItem[0]) || false;
        const isValueEqual: any = targ ? targ[1] === oldItem[1] : false;
        return !(targ && isValueEqual);
      });
      // filter if old items was empty string
      if (oldItemsToDelete.length) {
        oldItemsToDelete = oldItemsToDelete.filter((el: any) => el[1].length);
      }

      // request to delete old rules
      oldItemsToDelete.forEach((el: any) => {
        this.deleteRule({
          project_id: this.project.id,
          rule_id: copyOfEMSRules[el[0]].warningRule,
        });
        this.deleteRule({ project_id: this.project.id, rule_id: copyOfEMSRules[el[0]].errorRule });
        delete copyOfEMSRules[el[0]];
      });

      // ==== create new rules
      let newItemsToCreate: any = currentArr.filter((currentItem: any) => {
        const targ: any = oldArr.find((oldItem: any) => oldItem[0] === currentItem[0]) || false;
        const isValueEqual: any = targ ? targ[1] === currentItem[1] : false;
        return !(targ && isValueEqual);
      });
      if (newItemsToCreate.length) {
        newItemsToCreate = newItemsToCreate.filter((el: any) => el[1].length);
      }
      const warningRules = newItemsToCreate.map((el: any) => {
        return {
          id: "",
          name: `${emsData.name}_${el[0]} Warning Rule`,
          active: true,
          timeout: 1,
          conditions: [
            {
              variable: el[1],
              and_or: false,
              condition: "equals",
              target: 1,
            },
          ],
          actions: [
            { type: "alert", params: { type: 1, body: "{{rule}} - Device has a Warning" } },
          ],
          created_at: "",
        };
      });
      const errorRules = newItemsToCreate.map((el: any) => {
        return {
          id: "",
          name: `${emsData.name}_${el[0]} Error Rule`,
          active: true,
          timeout: 1,
          conditions: [
            {
              variable: el[1],
              and_or: false,
              condition: "equals",
              target: 2,
            },
          ],
          actions: [{ type: "alert", params: { type: 2, body: "{{rule}} - Device has an Error" } }],
          created_at: "",
        };
      });
      const allRules = [...warningRules, ...errorRules];
      const responseRulesList = await this.addRules({
        project_id: this.project.id,
        rulesList: allRules,
      });
      newItemsToCreate.forEach((el: any) => {
        const warningRule = responseRulesList.find(
          (rule: any) => rule.name === `${emsData.name}_${el[0]} Warning Rule`,
        );
        const errorRule = responseRulesList.find(
          (rule: any) => rule.name === `${emsData.name}_${el[0]} Error Rule`,
        );
        const field = {
          [el[0]]: {
            warningRule: warningRule.id,
            errorRule: errorRule.id,
          },
        };
        copyOfEMSRules = { ...copyOfEMSRules, ...field };
      });
      emsData.data.meta.rules = copyOfEMSRules;
    },
    /**
     * Save Ml Model data in data base
     */
    async sendForm() {
      // blocked send button to avoid another clicks
      this.updatingDeviceProcess = true;

      const copy = JSON.parse(JSON.stringify(this.mlModel));
      const controllerMappings = { ...this.systemsForm, ...this.controllerMainMappingsLocal };

      copy.data.meta = { ...copy.data.meta, ...this.additionalFields };

      copy.project_id = this.project.id;
      copy.data.meta.controllerMappings = controllerMappings;

      // ======== rules
      // ==== when create ems
      if (!this.isEditModal) {
        await this.addRulesWhenCreateEMS(copy);
        // ==== when edit ems
      } else {
        await this.generalRulesWhenUpdateEMS(copy);
        if (this.deviceData.data.type === "EMS") {
          await this.addSystemRulesWhenUpdateEMS(copy);
        }
      }

      this.$emit("handleControl", copy);
      this.$emit("closeDialog");

      // unblock send button
      this.updatingDeviceProcess = false;
    },
    onStageChange(val: number, oldVal: number) {
      if (oldVal === 1 && val === 2) {
        this.copyOfSystemsForValidationError = null;
        this.copyOfSystemsForValidationError = JSON.parse(JSON.stringify(this.systemsForm));
      }
      if (val === 2) {
        // init currentSystem when go on stage 2. Needs to avoid error when we feel some mappings on system what we later delete
        this.currentGroup = "ems";
        this.currentSystem = null;

        // load variables list for mappings
        this.fetchMeasurements(this.$route.params.id as string);
      }
    },
    handleSystemGroupChange() {
      this.systemTab = 0;
    },
    fetchMeasurements(projectId: string): Promise<void> {
      return this.$store.dispatch("measurements/fetchMeasurements", projectId);
    },
    loadRules(project_id: any): Promise<any> {
      return this.$store.dispatch("rules/loadRules", project_id);
    },
    addRule(payload: any): Promise<any> {
      return this.$store.dispatch("rules/addRule", payload);
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
.hide-optional {
  display: none;
}

.energy-optimization-schema {
  .v-window {
    .stage-1 {
      .group-title {
        font-size: 20px;
        color: #6cc1fe;
      }
    }

    .stage-2 {
      .system-title {
        font-size: 20px;
      }
    }

    .stage-3 {
      position: relative;

      .updating-process-placeholder {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.44);
        z-index: 2;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 20px;
      }

      .tariff-title {
        font-size: 20px;
        text-align: center;
      }
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
    line-height: 12px;
  }

  .mappings-title {
    height: 30px;
  }

  .v-input--selection-controls {
    padding: 0 !important;
    margin: 0 !important;
  }
}

.ems-systems-navigation {
  .system-unfilled {
    color: red;
  }
}

.manage-ems-systems-menu {
  background: rgb(var(--v-theme-surface));
}
</style>
