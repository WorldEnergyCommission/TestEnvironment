<!-- eslint-disable vuetify/no-deprecated-components -->
<template>
  <div class="energy-schema h-100">
    <Stepper v-model="stage">
      <StepperHeader :stage="stage" translation-sub-path="manageDevice" />
      <StepperWindow>
        <Step :step="1">
          <template #content>
            <CoreContainer class="py-0 stage-1" fluid>
              <CoreRow>
                <CoreColumn offset-sm="4" sm="4">
                  <CoreTextField
                    v-model="device.name"
                    :label="$t('modals.manageDevice.form.name')"
                    hide-details
                    max-length="30"
                  />
                  <CoreSelect
                    v-model="numberOfCranes"
                    :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                    :label="$t('devices.KineticPower.modalWindowStuff.numberOfCranes')"
                    class="pt-2"
                    hide-details
                    hide-selected
                  />
                  <div>
                    <CoreSelect
                      v-model="numberCraneDrives"
                      :items="[1, 2, 3, 4]"
                      :label="$t('devices.KineticPower.modalWindowStuff.numberOfDrives')"
                      class="pt-2"
                      hide-details
                      hide-selected
                    />
                  </div>
                </CoreColumn>
              </CoreRow>
            </CoreContainer>
          </template>
          <template #footer>
            <CoreButton
              v-if="!isEditModal"
              class="mr-4"
              button-type="primary"
              @click="$emit('backToChoosingType')"
            >
              {{ $t("uiComponents.buttons.back") }}
            </CoreButton>
            <CoreTooltip :disabled="isDeviceNameValid" location="top">
              <template #activator="{ props }">
                <div style="display: inline-block" v-bind="props">
                  <CoreButton
                    :disabled="!isDeviceNameValid"
                    button-type="primary"
                    @click="goToStageTwo()"
                  >
                    {{ $t("uiComponents.buttons.next") }}
                    <template #iconRight>
                      <CoreIcon size="small"> fas fa-chevron-right </CoreIcon>
                    </template>
                  </CoreButton>
                </div>
              </template>
              <span>{{ $t("modals.manageDevice.tooltips.nameType") }}</span>
            </CoreTooltip>
          </template>
        </Step>

        <Step :step="2">
          <template #content>
            <CoreContainer class="stage-2" fluid>
              <!-- Place for Button Menu -->
              <CoreRow>
                <div class="pt-2 mb-4" style="display: flex; flex-wrap: wrap">
                  <div v-for="(item, index) in menuItems" :key="index">
                    <CoreMenu>
                      <template #activator="{ props }">
                        <CoreBadge :value="false" color="error" dot offset-x="10">
                          <CoreButton
                            :class="[{ 'nav-active-button': item === selectedMenuItem }]"
                            button-type="primary"
                            size="small"
                            v-bind="props"
                          >
                            {{ $t(`devices.KineticPower.menuButtons.${item}`) }}
                          </CoreButton>
                        </CoreBadge>
                      </template>
                      <CoreList class="manage-energy-view-navigation" density="compact">
                        <CoreListItem
                          v-for="(instance, index) in mapForDropDownItems[item]"
                          :key="index"
                          link
                          @click="filterString = instance"
                        >
                          <CoreListItemTitle
                            v-if="instance.includes('crane')"
                            :class="{
                              'system-unfilled': systemsMappingsByGroups
                                .get(item)
                                .instances.get(instance),
                            }"
                          >
                            {{
                              $t(`devices.KineticPower.menuButtons.${instance.slice(0, -1)}`) + " "
                            }}{{ index + 1 }}
                          </CoreListItemTitle>
                          <CoreListItemTitle
                            v-if="!instance.includes('crane')"
                            :class="{
                              'system-unfilled': systemsMappingsByGroups
                                .get(item)
                                .instances.get(instance),
                            }"
                          >
                            {{
                              $t(`devices.KineticPower.menuButtons.${instance.slice(0, -1)}`) + " "
                            }}
                          </CoreListItemTitle>
                        </CoreListItem>
                      </CoreList>
                    </CoreMenu>
                  </div>
                </div>
              </CoreRow>
              <CoreRow>
                <CoreColumn v-if="stage === 2 && filterString.includes('crane')" :cols="12">
                  <div class="d-flex">
                    <div style="width: 33%">
                      <div class="pb-1 mx-5">individual Mappings</div>
                      <!-- State Horizontal -->
                      <ComboboxField
                        v-model="deviceMappings.cranes[filterString].stateHorizontal"
                        :items="measurementsKeysList"
                        :label="$t('devices.KineticPower.mappings.stateHorizontal')"
                        :optional="false"
                        class="pb-2 mx-5"
                      />
                      <!-- stateReady -->
                      <ComboboxField
                        v-model="deviceMappings.cranes[filterString].stateReady"
                        :items="measurementsKeysList"
                        :label="$t('devices.KineticPower.mappings.stateReady')"
                        :optional="false"
                        class="pb-2 mx-5"
                      />
                      <!-- stateActive -->
                      <ComboboxField
                        v-model="deviceMappings.cranes[filterString].stateActive"
                        :items="measurementsKeysList"
                        :label="$t('devices.KineticPower.mappings.stateActive')"
                        :optional="false"
                        class="pb-2 mx-5"
                      />
                      <!-- countContainerNegative -->
                      <ComboboxField
                        v-model="deviceMappings.cranes[filterString].countContainerNegative"
                        :items="measurementsKeysList"
                        :label="$t('devices.KineticPower.mappings.countContainerNegative')"
                        :optional="false"
                        class="pb-2 mx-5"
                      />
                      <!-- countContainerPositive -->
                      <ComboboxField
                        v-model="deviceMappings.cranes[filterString].countContainerPositive"
                        :items="measurementsKeysList"
                        :label="$t('devices.KineticPower.mappings.countContainerPositive')"
                        :optional="false"
                        class="pb-2 mx-5"
                      />
                      <!-- socNegative -->
                      <ComboboxField
                        v-model="deviceMappings.cranes[filterString].socNegative"
                        :items="measurementsKeysList"
                        :label="$t('devices.KineticPower.mappings.socNegative')"
                        :optional="false"
                        class="pb-2 mx-5"
                      />
                      <!-- socPositive -->
                      <ComboboxField
                        v-model="deviceMappings.cranes[filterString].socPositive"
                        :items="measurementsKeysList"
                        :label="$t('devices.KineticPower.mappings.socPositive')"
                        :optional="false"
                        class="pb-2 mx-5"
                      />
                      <!-- cranePositionX -->
                      <ComboboxField
                        v-model="deviceMappings.cranes[filterString].cranePositionX"
                        :items="measurementsKeysList"
                        :label="$t('devices.KineticPower.mappings.cranePositionX')"
                        :optional="false"
                        class="pb-2 mx-5"
                      />
                      <!-- errorWarningState -->
                      <ComboboxField
                        v-model="deviceMappings.cranes[filterString].errorWarningState"
                        :items="measurementsKeysList"
                        :label="$t('devices.KineticPower.mappings.errorWarningState')"
                        :optional="false"
                        class="pb-2 mx-5"
                      />
                    </div>
                    <div style="width: 33%">
                      <div class="pb-1 mx-5">Drive Mappings</div>
                      <div
                        v-for="(item, key, index) in deviceMappings.cranes[filterString].drives"
                        :key="key"
                      >
                        <ComboboxField
                          v-model="deviceMappings.cranes[filterString].drives[key].stateVertical"
                          :items="measurementsKeysList"
                          :label="
                            $t('devices.KineticPower.modalWindowStuff.driveSubtitle') +
                            (index + 1) +
                            '_' +
                            $t('devices.KineticPower.mappings.stateVertical')
                          "
                          :optional="false"
                          class="pb-2 mx-5"
                        />
                        <ComboboxField
                          v-model="deviceMappings.cranes[filterString].drives[key].positionY"
                          :items="measurementsKeysList"
                          :label="
                            $t('devices.KineticPower.modalWindowStuff.driveSubtitle') +
                            (index + 1) +
                            '_' +
                            $t('devices.KineticPower.mappings.positionY')
                          "
                          :optional="false"
                          class="pb-2 mx-5"
                        />
                        <ComboboxField
                          v-model="deviceMappings.cranes[filterString].drives[key].hasContainer"
                          :items="measurementsKeysList"
                          :label="
                            $t('devices.KineticPower.modalWindowStuff.driveSubtitle') +
                            (index + 1) +
                            '_' +
                            $t('devices.KineticPower.mappings.hasContainer')
                          "
                          :optional="false"
                          class="pb-2 mx-5"
                        />
                      </div>
                    </div>
                  </div>
                </CoreColumn>
                <CoreColumn v-if="stage === 2 && !filterString.includes('crane')" :cols="12">
                  <div class="d-flex">
                    <div style="width: 33%">
                      <ComboboxField
                        v-model="deviceMappings.actualPower"
                        :items="measurementsKeysList"
                        :label="$t('devices.KineticPower.mappings.actualPower')"
                        :optional="false"
                        class="pb-2 mx-5"
                      />
                    </div>
                  </div>
                </CoreColumn>
              </CoreRow>
            </CoreContainer>
          </template>
          <template #footer>
            <div class="stage2-actions">
              <div>
                <CoreButton class="mr-4" button-type="primary" @click="() => (stage = 1)">
                  <template #icon>
                    <CoreIcon color="accent" size="small"> fas fa-chevron-left </CoreIcon>
                  </template>
                  {{ $t("uiComponents.buttons.previous") }}
                </CoreButton>
                <CoreTooltip :disabled="kinecticPowerMappingValidation" location="top">
                  <template #activator="{ props }">
                    <div style="display: inline-block" v-bind="props">
                      <CoreButton
                        :disabled="!kinecticPowerMappingValidation"
                        button-type="primary"
                        @click="stage = 3"
                      >
                        {{ $t("uiComponents.buttons.next") }}
                        <template #iconRight>
                          <CoreIcon size="small"> fas fa-chevron-right </CoreIcon>
                        </template>
                      </CoreButton>
                    </div>
                  </template>
                  <span>{{ $t("modals.manageDevice.tooltips.requiredFields") }}</span>
                </CoreTooltip>
              </div>
              <div>
                <CoreCheckbox
                  v-model="showOptionalFields"
                  :false-value="false"
                  :label="$t('modals.manageDevice.showOptionalFields')"
                  :true-value="true"
                  hide-details
                />
              </div>
            </div>
          </template>
        </Step>

        <Step :step="3">
          <template #content>
            <CoreContainer fluid>
              <CoreRow>
                <CoreColumn offset-sm="3" sm="6">
                  <CoreSelect
                    v-model="device.collection_id"
                    :items="sortedRooms"
                    :label="$t('modals.manageDevice.form.areas')"
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
            <CoreButton class="mr-4" button-type="primary" @click="() => (stage = 2)">
              <template #icon>
                <CoreIcon color="accent" size="small"> fas fa-chevron-left </CoreIcon>
              </template>
              {{ $t("uiComponents.buttons.previous") }}
            </CoreButton>
            <CoreTooltip :disabled="settingsValidation" location="top">
              <template #activator="{ props }">
                <div style="display: inline-block" v-bind="props">
                  <CoreButton
                    :disabled="!settingsValidation"
                    button-type="primary"
                    @click="sendForm"
                  >
                    <template #iconRight>
                      <CoreIcon color="accent" size="15"> fas fa-paper-plane </CoreIcon>
                    </template>
                    {{ $t("uiComponents.buttons.send") }}
                  </CoreButton>
                </div>
              </template>
              <span>{{ $t("modals.manageDevice.tooltips.areaFields") }}</span>
            </CoreTooltip>
          </template>
        </Step>
      </StepperWindow>
    </Stepper>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ComboboxField from "@/ui/components/modals/components/form/ComboboxField.vue";
import StepperHeader from "@/ui/components/modals/components/ManageStepperHeader.vue";
import { Step, Stepper, StepperWindow } from "@/ui/components/modals/components/Stepper";
import SchemaBase from "@/ui/components/modals/ManageDevice/schemas/SchemaBase";

/**
 * Scheme to create, modify a specific device.
 * Specified in the device type definition in store/devices/devicesTypes.ts
 */
export default defineComponent({
  components: {
    ComboboxField,
    StepperHeader,
    Step,
    Stepper,
    StepperWindow,
  },
  extends: SchemaBase,
  data() {
    const mapForDropDownItems: any = {
      crane: [],
    };
    const menuItems: string[] = [];
    const deviceOptionalDescription: any = {};
    const deviceBasicAdditionalControlsSchema: any = {};
    const selectedCraneMappings: any = {};

    return {
      modularDeviceMapping: {
        crane: [true, 1],
      },
      selectedCraneMappings,
      deviceBasicAdditionalControlsSchema,
      deviceOptionalDescription,
      menuItems,
      selectedMenuItem: "",
      filterString: "Main",
      mapForDropDownItems,
      numberOfCranes: 1,
      numberCraneDrives: 1,
    };
  },
  computed: {
    /** steps validation */
    /**
     * Combines systems by group. Creates Map collection width all group validation status
     * and group instances statuses.
     * @return Map collection with status of validation for every system
     */
    systemsMappingsByGroups() {
      const currentMappings = Object.entries(this.device.data.mappings).map((el: any) => [
        el[0].split("_")[0],
        el[1],
      ]);
      const filteredByExistInstances: any = Object.entries(this.mapForDropDownItems).filter(
        (system: any) => system[1].length,
      );
      const filled: any = filteredByExistInstances.map((system: any) => {
        const systemName: any = system[0];
        const systemInstances: any = system[1];
        const systemInstancesWithMappings = systemInstances.map((instance: any) => {
          const mappingsValues: any = currentMappings
            .filter((el: any) => el[0] === instance)
            .map((el: any) => el[1]);
          // const titleObj: any = this.energyViewTitlesMap.find((el: any) => el.key === `${instance}_Title`);
          const isUnFilled: any = [...mappingsValues].some((el: any) => !el);
          return [instance, isUnFilled];
        });
        const isGroupUnfilled = systemInstancesWithMappings
          .map((system: [string, boolean]) => system[1])
          .some((el: boolean) => el);
        return [
          systemName,
          {
            instances: new Map(systemInstancesWithMappings),
            unFilled: isGroupUnfilled,
          },
        ];
      });
      return new Map(filled);
    },
    /**
     * Checks mappings if they not valid
     * @return true if mappings filled, else false
     */
    kinecticPowerMappingValidation() {
      if (this.stage === 2) {
        const allMappingsValidation: any = Array.from(this.systemsMappingsByGroups.values()).map(
          (el: any) => el.unFilled,
        );
        return !allMappingsValidation.some((el: any) => el);
      }
      return true;
    },
  },
  async created() {
    const copy = JSON.parse(JSON.stringify(this.deviceData));
    this.device = copy;
    if (this.deviceData.data.mappings.cranes?.crane1 !== undefined) {
      this.numberCraneDrives = Object.keys(
        this.deviceData.data.mappings.cranes.crane1.drives,
      ).length;
      this.numberOfCranes = Object.keys(this.deviceData.data.mappings.cranes).length;
    }
  },
  methods: {
    sortArray(array: any[]): void {
      array.sort((a: any, b: any) => {
        if (a < b) {
          return -1;
        }
        if (b < a) {
          return 1;
        }
        return 0;
      });
    },
    goToStageTwo() {
      let deviceModularMapping: any = { cranes: {} };
      const basicDevicesArray: any = [];
      const deviceSchemasMap: any = new Map();
      // generate basic modular Devicemapping ----->  [deviceData.data.mapping.cranes.xxx]
      if (this.deviceData.data.mappings.cranes !== undefined) {
        deviceModularMapping = this.deviceData.data.mappings;
      } else {
        deviceModularMapping.actualPower = "";
      }
      for (let index = 1; index <= 10; index++) {
        if (
          deviceModularMapping.cranes[`crane${index}`] === undefined &&
          index <= this.numberOfCranes
        ) {
          deviceModularMapping.cranes[`crane${index}`] = {
            stateHorizontal: "",
            stateReady: "",
            stateActive: "",
            errorWarningState: "",
            countContainerNegative: "",
            countContainerPositive: "",
            socNegative: "",
            socPositive: "",
            cranePositionX: "",
            drives: {},
          };
          // generate drives Objects
          for (let i = 1; i <= this.numberCraneDrives; i++) {
            deviceModularMapping.cranes[`crane${index}`].drives[`drive${i}`] = {
              stateVertical: "",
              positionY: "",
              hasContainer: "",
            };
          }
        } else {
          // if crane is mapped but not needed anymore because the number of cranes is reduced. The object of the crane will be set to undefined
          if (index > this.numberOfCranes) {
            if (deviceModularMapping.cranes[`crane${index}`] !== undefined) {
              delete deviceModularMapping.cranes[`crane${index}`];
            }
          } else {
            // check for crane drive update
            for (let driveIndex = 1; driveIndex <= 4; driveIndex++) {
              if (
                deviceModularMapping.cranes[`crane${index}`].drives[`drive${driveIndex}`] !==
                  undefined &&
                driveIndex > this.numberCraneDrives
              ) {
                // to many drives
                delete deviceModularMapping.cranes[`crane${index}`].drives[`drive${driveIndex}`];
              } else if (
                deviceModularMapping.cranes[`crane${index}`].drives[`drive${driveIndex}`] ===
                  undefined &&
                driveIndex <= this.numberCraneDrives
              ) {
                // drives added
                deviceModularMapping.cranes[`crane${index}`].drives[`drive${driveIndex}`] = {
                  stateVertical: "",
                  positionY: "",
                  hasContainer: "",
                };
              }
            }
          }
        }
      }
      this.selectedCraneMappings = deviceModularMapping;
      // console.log('Test generate deviceModularMapping', deviceModularMapping);

      // part for deviceSchema
      deviceSchemasMap.set("actualPower", {
        label: "Actual Power",
        description: "Number Value",
        optional: true,
      });
      this.generateMenuButtons();
      this.stage = 2;
    },
    /** Generates the menuItems for the buttons and the map for the Dropdown for each button */
    generateMenuButtons() {
      this.menuItems = ["main", "crane"];
      this.mapForDropDownItems = {
        main: ["main1"],
        crane: [],
      };

      Object.keys(this.selectedCraneMappings.cranes).forEach((key: any, index: number) => {
        this.mapForDropDownItems.crane.push(key);
      });
    },
    /**
     * Save device data in data base
     */
    async sendForm() {
      const copy = JSON.parse(JSON.stringify(this.device));

      copy.data.mappings = this.deviceMappings;

      copy.data.meta = {};
      copy.data.meta.deviceSchema = {};
      copy.data.meta.deviceSchema.additionalBasicDevices = [];
      copy.data.meta.deviceSchema.basicDevices = [];
      copy.data.meta.minMaxBorders = {};
      // add rules
      /*
                if (!this.isEditModal) {
                  await this.addRulesWhenCreateDevice(copy);
                } else {
                  await this.addRulesWhenEditDevice(copy);
                }
                */
      console.log("last copy", copy);
      this.$emit("handleControl", copy);
      this.$emit("closeDialog");
    },
  },
});
</script>

<style lang="scss">
.energy-schema {
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

      .device-title {
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
}

.manage-energy-view-navigation {
  .system-unfilled {
    color: red;
  }
}
</style>
