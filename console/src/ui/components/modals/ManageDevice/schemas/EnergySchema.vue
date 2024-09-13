<!-- eslint-disable vuetify/no-deprecated-components -->
<template>
  <div class="energy-schema h-100">
    <Stepper v-model="stage">
      <StepperHeader :stage="stage" translation-sub-path="manageDevice" />

      <StepperWindow>
        <Step :step="1">
          <template #content>
            <CoreContainer class="py-1 stage-1" fluid>
              <CoreForm v-model="isFirstStageValid">
                <CoreRow class="py-4">
                  <CoreColumn offset-sm="4" sm="4">
                    <CoreTextField
                      v-model="device.name"
                      :label="$t('modals.manageDevice.form.name')"
                      :rules="[rules.required]"
                      max-length="30"
                    />
                  </CoreColumn>
                </CoreRow>

                <div class="devices-mappings-config" style="overflow-x: auto">
                  <CoreContainer class="" style="margin-left: auto; margin-right: auto">
                    <CoreRow class="section-title my-4" no-gutters>
                      <CoreColumn>
                        {{ $t("modals.manageDevice.energySchema.stage1.producer.title") }}
                      </CoreColumn>
                    </CoreRow>

                    <EnergyInputRow
                      v-model.number="modularDevicesCount.pvSystem"
                      :prop-title="$t('modals.manageDevice.energySchema.stage1.producer.pvSystem')"
                      :max="envLimits.energy_view.maxPvSystemQuantity"
                    />
                    <EnergyInputRow
                      v-model.number="modularDevicesCount.generator"
                      :prop-title="$t('modals.manageDevice.energySchema.stage1.producer.generator')"
                      :max="envLimits.energy_view.maxGeneratorQuantity"
                    />

                    <CoreRow class="section-title my-4" no-gutters>
                      <CoreColumn>
                        {{ $t("modals.manageDevice.energySchema.stage1.producerConsumer.title") }}
                      </CoreColumn>
                    </CoreRow>

                    <EnergyInputRow
                      v-model.number="modularDevicesCount.grid"
                      :max="1"
                      :prop-title="
                        $t('modals.manageDevice.energySchema.stage1.producerConsumer.grid')
                      "
                    />
                    <EnergyInputRow
                      v-model.number="modularDevicesCount.battery"
                      :prop-title="
                        $t('modals.manageDevice.energySchema.stage1.producerConsumer.battery')
                      "
                      :max="envLimits.energy_view.maxBatteryQuantity"
                    />

                    <CoreRow class="section-title my-4" no-gutters>
                      <CoreColumn>
                        {{ $t("modals.manageDevice.energySchema.stage1.consumer.title") }}
                      </CoreColumn>
                    </CoreRow>

                    <EnergyInputRow
                      v-model.number="modularDevicesCount.houseConsumption"
                      :prop-title="
                        $t('modals.manageDevice.energySchema.stage1.consumer.houseConsumption')
                      "
                      :max="envLimits.energy_view.maxHouseConsumptionQuantity"
                    />
                    <EnergyInputRow
                      v-model.number="modularDevicesCount.evChargingStation"
                      :prop-title="
                        $t('modals.manageDevice.energySchema.stage1.consumer.EVChargingStation')
                      "
                      :max="envLimits.energy_view.maxEvChargingStationQuantity"
                    />
                    <EnergyInputRow
                      v-model.number="modularDevicesCount.electricHeating"
                      :prop-title="
                        $t('modals.manageDevice.energySchema.stage1.consumer.electricHeating')
                      "
                      :max="envLimits.energy_view.maxElectricHeatingElementQuantity"
                    />
                    <EnergyInputRow
                      v-model.number="modularDevicesCount.heatingPump"
                      :prop-title="
                        $t('modals.manageDevice.energySchema.stage1.consumer.heatingPump')
                      "
                      :max="envLimits.energy_view.maxHeatingPumpQuantity"
                    />
                    <EnergyInputRow
                      v-model.number="modularDevicesCount.otherBigConsumer"
                      :prop-title="
                        $t('modals.manageDevice.energySchema.stage1.consumer.otherBigConsumer')
                      "
                      :max="envLimits.energy_view.maxBigConsumerQuantity"
                    />

                    <CoreRow class="section-title my-4" no-gutters>
                      <CoreColumn>
                        {{ $t("modals.manageDevice.energySchema.stage1.heat.title") }}
                      </CoreColumn>
                    </CoreRow>

                    <EnergyInputRow
                      v-model.number="modularDevicesCount.heatMeter"
                      :prop-title="$t('modals.manageDevice.energySchema.stage1.heat.heatMeter')"
                      :max="envLimits.energy_view.maxHeatMeterQuantity"
                    />
                  </CoreContainer>
                </div>
              </CoreForm>
            </CoreContainer>
          </template>
          <template #footer>
            <FirstStepActions
              :disable-next-button="!isFirstStageValid || getModularDevicesCount() == 0"
              :next-button-tool-tip="$t('modals.manageDevice.tooltips.nameType')"
              :show-back-button="!isEditModal"
              :hide-next-tool-tip="isDeviceNameValid"
              @back="$emit('backToChoosingType')"
              @next="goToStageTwo()"
            />
          </template>
        </Step>

        <Step :step="2">
          <template #content>
            <CoreContainer class="stage-2" fluid>
              <!-- Place for Button Menu -->

              <CoreRow>
                <div class="d-flex flex-wrap justify-center">
                  <div
                    v-for="(group, groupIndex) in menuItems as SystemTypeString[]"
                    :key="groupIndex"
                  >
                    <CoreBadge
                      :model-value="!systemsMappingsByGroups.get(group)?.isGroupFilled"
                      color="error"
                      dot
                    >
                      <NavigationTab
                        :is-active="system === group"
                        :tab-title="group"
                        @click="
                          systemGroup = group;
                          filterString = dropdownItems[group][0];
                        "
                      />
                    </CoreBadge>
                  </div>
                </div>
              </CoreRow>

              <CoreRow>
                <CoreTabs v-model="filterString" class="mt-5">
                  <div
                    v-for="(systemItem, systemIndex) in dropdownItems[systemGroup]"
                    :key="systemIndex"
                  >
                    <CoreBadge
                      :model-value="!isSystemFilled.get(systemItem)"
                      color="error"
                      dot
                      offset-x="5"
                    >
                      <CoreTab
                        :key="systemIndex"
                        :value="systemItem"
                        @click="filterString = systemItem"
                      >
                        {{ systemItem }}
                      </CoreTab>
                    </CoreBadge>
                  </div>
                </CoreTabs>
              </CoreRow>

              <CoreRow>
                <CoreColumn :cols="$vuetify.display.mobile ? 12 : 4">
                  <div v-for="(item, index) in mappingNames" :key="index">
                    <div
                      v-if="
                        item !== 'ShowEvent_errorWarningState' &&
                        item.match(`(${filterString})([^0-9]|)(_)`)
                      "
                    >
                      <ComboboxField
                        v-model="device.data.mappings[item]"
                        :items="measurementsKeysList"
                        :label="item"
                        :optional="false"
                        class="pb-2"
                      />
                    </div>
                  </div>
                  <div v-if="showOptionalFields" class="pt-4">
                    <div class="optional mb-2">Optional</div>
                    <CoreCombobox
                      v-model="device.data.mappings['ShowEvent_errorWarningState']"
                      :items="measurementsKeysList"
                      hide-details
                      hide-selected
                      label="ShowEvent_errorWarningState"
                    />
                  </div>
                </CoreColumn>
                <CoreColumn :cols="$vuetify.display.mobile ? 12 : 4">
                  <div v-for="(item, index) in energyViewTitlesMap" :key="index">
                    <div>
                      <TextField
                        v-if="item.key.match(`(${filterString})([^0-9]|)(_)`)"
                        v-model="item.value"
                        :label="item.key"
                        :optional="false"
                        class="pb-2"
                        max-length="30"
                      />
                    </div>
                  </div>
                </CoreColumn>
                <CoreColumn
                  v-if="
                    filterString && filterString.includes('heatMeter') && intervals[filterString]
                  "
                  sm="4"
                >
                  <CoreSelect
                    v-model="intervals[filterString]"
                    :items="intervalOptions"
                    :label="$t('uiComponents.defaultSchema.interval')"
                    hide-details
                    hide-selected
                  />
                </CoreColumn>
              </CoreRow>
            </CoreContainer>
          </template>
          <template #footer>
            <SecondStepActions
              v-model="showOptionalFields"
              :disable-next-button="!energySchemaMappingValidation"
              :next-button-tool-tip="$t('modals.manageDevice.tooltips.requiredFields')"
              :hide-next-tool-tip="energySchemaMappingValidation"
              @back="stage = 1"
              @next="stage = 3"
            />
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
                  <CoreTextField
                    v-model="device.data.meta.sizePowerConnection"
                    class="pb-1 pt-2"
                    hide-details
                    hide-selected
                    label="PV Scaling"
                    type="number"
                  />
                  <CoreTextField
                    v-model="device.data.meta.maxPerformanceProducer"
                    class="py-1"
                    hide-details
                    hide-selected
                    label="Consumption Scaling"
                    type="number"
                  />
                  <CoreTextField
                    v-model="device.data.meta.maxPowerConsumtion"
                    class="py-1"
                    hide-details
                    hide-selected
                    label="Max Grid Size"
                    type="number"
                  />
                  <CoreSelect
                    v-model="device.data.selectedWidth"
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
              :next-button-tool-tip="$t('modals.manageDevice.tooltips.areaFields')"
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
import { defineComponent } from "vue";

import EnergyInputRow from "./EnergyInputRow.vue";
import {
  getDeviceTypeKeys,
  systemIntervals,
  SystemTypeString,
} from "@/ui/components/devices/devices/EnergyViewDevice/EnergyViewSystems";
import {
  FinalStepActions,
  FirstStepActions,
  SecondStepActions,
} from "@/ui/components/modals/components/Actions";
import ComboboxField from "@/ui/components/modals/components/form/ComboboxField.vue";
import TextField from "@/ui/components/modals/components/form/TextField.vue";
import StepperHeader from "@/ui/components/modals/components/ManageStepperHeader.vue";
import NavigationTab from "@/ui/components/modals/components/NavigationTab.vue";
import { Step, Stepper, StepperWindow } from "@/ui/components/modals/components/Stepper";
import SchemaBase from "@/ui/components/modals/ManageDevice/schemas/SchemaBase";
import { Validation } from "@/ui/mixins/validation";
import { envLimits } from "@/utils/env";

type MappingGroup = {
  instances: Map<string, boolean>;
  isGroupFilled: boolean;
};

/**
 * Scheme to create, modify a specific device.
 * Specified in the device type definition in store/devices/devicesTypes.ts
 */
export default defineComponent({
  components: {
    ComboboxField,
    TextField,
    NavigationTab,
    EnergyInputRow,
    FirstStepActions,
    SecondStepActions,
    FinalStepActions,
    StepperHeader,
    Step,
    Stepper,
    StepperWindow,
  },
  mixins: [Validation, SchemaBase],
  data() {
    const systemGroup = undefined as SystemTypeString | undefined;
    const dropdownItems: Record<SystemTypeString, string[]> = {
      pvSystem: [],
      generator: [],
      heatProducer: [],
      grid: [],
      battery: [],
      houseConsumption: [],
      evChargingStation: [],
      electricHeating: [],
      heatingPump: [],
      otherBigConsumer: [],
      heatMeter: [],
    };
    const menuItems: string[] = [];
    const deviceOptionalDescription: any = {};
    const mappingNames: string[] = [];
    const intervals: Record<string, string> = {};
    const energyViewTitlesMap = [] as any[];
    const modularDevicesCount: Record<SystemTypeString, number> = {
      pvSystem: 2,
      generator: 0,
      heatProducer: 0,
      grid: 1,
      battery: 0,
      houseConsumption: 0,
      evChargingStation: 0,
      electricHeating: 0,
      heatingPump: 0,
      otherBigConsumer: 0,
      heatMeter: 0,
    };

    return {
      isFirstStageValid: false,
      modularDevicesCount,
      energyViewTitlesMap,
      intervals,
      mappingNames,
      basicDevicesList: [],
      deviceOptionalDescription,
      menuItems,
      selectedMenuItem: "",
      filterString: "pvSystem1",
      dropdownItems,
      intervalOptions: [...systemIntervals.keys()],
      chartWidthOptions: ["full", "half"],
      system: "",
      systemGroup,
      envLimits,
    };
  },
  computed: {
    /** steps validation */
    isSystemFilled() {
      return [...this.systemsMappingsByGroups].reduce((carry, [_group, system]) => {
        system.instances.forEach((value, key) => {
          carry.set(key, value);
        });
        return carry;
      }, new Map<string, boolean>());
    },
    /**
     * Combines systems by group. Creates Map collection with all group validation status
     * and group instances statuses.
     * @return Map collection with status of validation for every system
     */
    systemsMappingsByGroups(): Map<string, MappingGroup> {
      const currentMappings = Object.entries(this.device.data.mappings).map(([key, value]) => [
        key.split("_").shift(),
        value,
      ]);

      const filteredByExistInstances: any = Object.entries(this.dropdownItems).filter(
        (system: any) => system[1].length,
      );
      const filled: any = filteredByExistInstances.map((system: any) => {
        const systemName: any = system[0];
        const systemInstances: any = system[1];
        const systemInstancesWithMappings = systemInstances.map((instance: any) => {
          let mappingsValues: any = currentMappings
            .filter((el: any) => el[0] === instance)
            .map((el: any) => el[1]);
          mappingsValues = !mappingsValues.length ? [""] : mappingsValues;
          const titleObj: any = this.energyViewTitlesMap.find(
            (el: any) => el.key === `${instance}_Title`,
          );

          const isFilled: any = ![...mappingsValues, titleObj.value].some((el: any) => !el);
          return [instance, isFilled];
        });
        const isGroupFilled = !systemInstancesWithMappings
          .map((system: [string, boolean]) => system[1])
          .some((el: boolean) => !el);
        return [
          systemName,
          {
            instances: new Map(systemInstancesWithMappings),
            isGroupFilled,
          },
        ];
      });

      return new Map(filled);
    },
    /**
     * Combined validation of all mappings in stage 2
     * @return boolean, status of stage 2 validation
     */
    energySchemaMappingValidation() {
      if (this.stage === 2) {
        const allMappingsValidation = Array.from(this.systemsMappingsByGroups.values()).map(
          (el) => el.isGroupFilled,
        );
        return !allMappingsValidation.includes(false);
      }
      return true;
    },
  },
  async created() {
    const copy = JSON.parse(JSON.stringify(this.deviceData));
    this.device = copy;
    if (this.activeRoomId.length && !this.isEditModal) copy.collection_id = this.activeRoomId;

    if (!this.device.data.meta) this.device.data.meta = {};

    // Don't fill mappings for new device
    if (Object.keys(this.deviceData.data.mappings).length === 0) {
      return;
    }

    // Fill modularDevicesCount with number of mappings with specific type,
    // e.g. modularDevicesCount.pvSystem = 2 if mappings pvSystem1_actualValue and pvSystem2_actualValue are found
    getDeviceTypeKeys().forEach((type) => {
      this.modularDevicesCount[type as SystemTypeString] = Object.keys(
        this.deviceData.data.mappings,
      ).reduce(
        (sum, currentMapping) =>
          sum + Number(currentMapping.includes(type) && currentMapping.endsWith("_actualValue")),
        0,
      );
    });
  },
  methods: {
    checkIsCurrentTabIsActive(tab: string, activeTab: string) {
      const clearedFromIndex: string = activeTab.replace(/[0-9]/, "");
      return tab === clearedFromIndex;
    },
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
      const deviceModularMapping: any = [];
      const basicDevicesArray: any = [];
      // devicesMappings.EnergyView.mappings = [];
      this.mappingNames = [];

      deviceModularMapping.push("ShowEvent_errorWarningState");
      Object.entries(this.modularDevicesCount).forEach(([key, value]) => {
        for (let x = 1; x <= value; x++) {
          basicDevicesArray.push(key + x);
          deviceModularMapping.push(`${key + x}_actualValue`);
          if (key === "battery") {
            deviceModularMapping.push(`${key + x}_socValue`);
          }
        }
      });

      this.sortArray(basicDevicesArray);
      this.sortArray(deviceModularMapping);

      this.energyViewTitlesMap = [];
      if (this.deviceData.data.meta !== undefined) {
        // copy titlemapping to not let text input fields directly modify the titleMapping
        const titleMappingCopy = this.deviceData.data.meta.titleMapping.map((e: any) => ({ ...e }));
        this.energyViewTitlesMap = titleMappingCopy
          .filter((element: any) => {
            const baseName = element.key.split("_")[0];

            return basicDevicesArray.includes(baseName);
          })
          .map((element: { key: string; value: string }) => ({
            key: `${element.key}_Title`,
            value: element.value,
          }));
      } else {
        this.energyViewTitlesMap = this.energyViewTitlesMap.filter((element: any) => {
          const baseName = element.key.split("_")[0];

          return basicDevicesArray.includes(baseName);
        });
      }

      this.mappingNames = deviceModularMapping;

      // fill intervals from the meta
      if (this.deviceData.data.meta !== undefined) {
        this.intervals = { ...structuredClone(this.deviceData.data.meta?.intervals) };
      }

      // fill empty intervals with defaults
      [...Array(this.modularDevicesCount.heatMeter).keys()].forEach((i) => {
        const instanceKey = `heatMeter${i + 1}`;
        if (!this.intervals[instanceKey]) {
          this.intervals[instanceKey] = "1h";
        }
      });

      Object.values(deviceModularMapping).forEach((element: any) => {
        if (element !== "ShowEvent_errorWarningState") {
          const finalString = element.split("_")[0];
          if (
            this.energyViewTitlesMap.find(
              (searchElement: any) => searchElement.key === finalString.concat("_Title"),
            ) === undefined
          ) {
            if (element.includes("actualValue")) {
              this.energyViewTitlesMap.push({ key: finalString.concat("_Title"), value: "Title" });
            }
          }
        }
      });
      Object.keys(this.device.data.mappings).forEach((key: any) => {
        if (!deviceModularMapping.includes(key)) {
          delete this.device.data.mappings[key];
        }
      });

      this.sortObjectArrayByKey(this.energyViewTitlesMap);

      this.basicDevicesList = basicDevicesArray;
      const deviceSchemasMap = new Map();
      this.deviceOptionalDescription = {};
      Object.values(this.mappingNames).forEach((mappingName) => {
        if (mappingName === "ShowEvent_errorWarningState") {
          deviceSchemasMap.set(mappingName, {
            label: "Error Warning Variable",
            description: "Allowed Values: 0 = OK, 1 = Warning, 2 = Error",
            optional: true,
          });
        } else {
          const labelName = mappingName.split("_");
          if (!labelName[0].includes("battery")) {
            deviceSchemasMap.set(mappingName, {
              label: `${labelName[0]} Actual Value`,
              description: `Actual Value of ${labelName[0]}`,
              optional: false,
            });
          } else {
            if (labelName[1].includes("soc")) {
              deviceSchemasMap.set(mappingName, {
                label: `${labelName[0]} Soc`,
                description: "Battery state of Charge",
                optional: false,
              });
            }
            if (labelName[1].includes("actual")) {
              deviceSchemasMap.set(mappingName, {
                label: `${labelName[0]} Actual Value`,
                description: "Actual Value of Battery",
                optional: false,
              });
            }
          }
        }
      });

      this.deviceOptionalDescription = Object.fromEntries(deviceSchemasMap);
      this.generateMenuButtons();
      this.stage = 2;
    },
    /**
     * Generates the menuItems for the buttons and the map for the Dropdown for each button
     */
    generateMenuButtons() {
      this.menuItems = [];
      this.dropdownItems = {
        pvSystem: [],
        generator: [],
        heatProducer: [],
        grid: [],
        battery: [],
        houseConsumption: [],
        evChargingStation: [],
        electricHeating: [],
        heatingPump: [],
        otherBigConsumer: [],
        heatMeter: [],
      };

      // pick system group names that are non zero in count
      this.menuItems = Object.entries(this.modularDevicesCount)
        .filter(([key, value]) => value > 0 && key !== "ShowEvent")
        .map(([key, _]) => key);

      this.mappingNames.forEach((mapping: string) => {
        const [mappingName, mappingSuffix] = mapping.split("_");
        const elementTypewithoutNumber = mappingName.replaceAll(/[0-9]/g, "");

        if (mappingName !== "ShowEvent" && mappingSuffix !== "socValue") {
          this.dropdownItems[elementTypewithoutNumber as SystemTypeString].push(mappingName);
        }
      });
      this.systemGroup = Object.keys(this.dropdownItems)[0] as SystemTypeString;
      this.filterString = this.dropdownItems[this.systemGroup][0]; // first instance from the group
    },
    sortObjectArrayByKey(array: any[]): void {
      array.sort((a: any, b: any) => {
        if (a.key < b.key) {
          return -1;
        }
        if (b.key < a.key) {
          return 1;
        }
        return 0;
      });
    },
    /**
     * Save device data in data base
     */
    async sendForm() {
      const copy = JSON.parse(JSON.stringify(this.device));
      copy.data.meta.titleMapping = this.energyViewTitlesMap;

      const schema = {
        additionalBasicDevices: [],
        basicDevices: [...this.basicDevicesList],
      };
      copy.data.meta.deviceSchema = { ...schema };
      copy.data.meta.minMaxBorders = {};

      // add rules
      if (!this.isEditModal) {
        await this.addRulesWhenCreateDevice(copy);
      } else {
        await this.addRulesWhenEditDevice(copy);
      }

      copy.data.meta.sizePowerConnection = parseInt(copy.data.meta.sizePowerConnection, 10);
      copy.data.meta.maxPerformanceProducer = parseInt(copy.data.meta.maxPerformanceProducer, 10);
      copy.data.meta.maxPowerConsumtion = parseInt(copy.data.meta.maxPowerConsumtion, 10);
      copy.data.meta.intervals = JSON.parse(JSON.stringify(this.intervals));

      this.$emit("handleControl", copy);
      this.$emit("closeDialog");
    },
    getModularDevicesCount() {
      return Object.values(this.modularDevicesCount).reduce(
        (sum, deviceTypeCount) => sum + deviceTypeCount,
        0,
      );
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
