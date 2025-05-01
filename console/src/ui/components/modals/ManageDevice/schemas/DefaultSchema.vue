<!-- eslint-disable vuetify/no-deprecated-components -->
<template>
  <div class="default-device-schema h-100">
    <Stepper v-model="stage">
      <StepperHeader :stage="stage" translation-sub-path="manageDevice" />

      <StepperWindow>
        <Step :step="1">
          <template #content>
            <CoreContainer fluid>
              <CoreRow>
                <CoreColumn offset-sm="4" sm="4">
                  <CoreTextField
                    v-model="device.name"
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
              :disable-next-button="!isDeviceNameValid"
              :next-button-tool-tip="$t('modals.manageDevice.tooltips.nameType')"
              :show-back-button="!isEditModal"
              :hide-next-tool-tip="isDeviceNameValid"
              @back="$emit('backToChoosingType')"
              @next="stage = 2"
            />
          </template>
        </Step>

        <Step :step="2">
          <template #content>
            <CoreContainer fluid>
              <CoreRow>
                <CoreColumn
                  v-for="(item, index) in deviceMappingsList"
                  :key="index"
                  :class="{
                    'hide-optional': !showOptionalFields && deviceMappings[item].optional,
                  }"
                  :cols="$vuetify.display.mobile ? 12 : 4"
                  class="mapping-field"
                >
                  <div>
                    <div v-if="deviceMappings[item].optional" class="optional mb-2">
                      <div>Optional</div>
                    </div>

                    <ExpressionTextArea
                      v-if="deviceMappings[item].type === 'ExpressionTextArea'"
                      :label="$t(`devices.${deviceData.data.type}.mappings.${item}.label`)"
                      :expression-variable="device.data.mappings[item]"
                      :has-margin="false"
                      @expression-change="(e) => (device.data.mappings[item] = e.fullExpression)"
                    />

                    <ComboboxField
                      v-else
                      v-model="device.data.mappings[item]"
                      :items="measurementsKeysList"
                      :label="$t(`devices.${deviceData.data.type}.mappings.${item}.label`)"
                      :optional="deviceMappings[item].optional"
                    />
                    <div class="description">
                      {{ $t(`devices.${deviceData.data.type}.mappings.${item}.description`) }}
                    </div>
                  </div>
                </CoreColumn>
                <CoreColumn v-if="deviceSchema.unitSelection" sm="4">
                  <div class="optional mb-2" />
                  <CoreTextField
                    v-model="unit"
                    :label="$t('uiComponents.defaultSchema.unit')"
                    hide-details
                    max-length="4"
                  />
                  <div class="description" />
                </CoreColumn>
                <CoreColumn v-if="deviceSchema.intervalSelection" sm="4">
                  <div class="optional mb-2" />
                  <CoreSelect
                    v-model="interval"
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
              :disable-next-button="!mappingValidation"
              :next-button-tool-tip="$t('modals.manageDevice.tooltips.requiredFields')"
              :hide-next-tool-tip="mappingValidation"
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
                    v-model="device.collection_id"
                    :items="sortedRooms"
                    :label="$t('modals.manageDevice.form.areas')"
                    hide-details
                    hide-selected
                    item-title="name"
                    item-value="id"
                  />
                </CoreColumn>
                <CoreColumn v-if="deviceSchema.iconSelection" cols="6" offset="3">
                  <div>
                    <IconList
                      :icons="icons"
                      :search="search"
                      :search-timeout="350"
                      @selected="onSelected"
                    />
                    <div>{{ $t("modals.manageDevice.form.iconDescription") }}</div>
                    <div style="height: 30px">
                      <template>
                        <img
                          v-if="device.data.meta.cover"
                          :src="`https://static.${domain}/icons/${device.data.meta.cover}.svg`"
                          :style="iconTheme()"
                          alt="icon"
                          height="30"
                          width="30"
                        />
                        <div
                          v-if="!device.data.meta.cover"
                          style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"
                        >
                          No Icon Selected
                        </div>
                      </template>
                    </div>
                    <CoreButton button-type="delete" @click="removeIcon">
                      {{ $t("modals.manageDevice.form.removeIconButton") }}
                    </CoreButton>
                  </div>
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

import IconList from "@/ui/components/components/IconList.vue";
import {
  FinalStepActions,
  FirstStepActions,
  SecondStepActions,
} from "@/ui/components/modals/components/Actions";
import ComboboxField from "@/ui/components/modals/components/form/ComboboxField.vue";
import StepperHeader from "@/ui/components/modals/components/ManageStepperHeader.vue";
import { Step, Stepper, StepperWindow } from "@/ui/components/modals/components/Stepper";
import ExpressionTextArea from "@/ui/components/modals/ManageCharts/ExpressionTextArea.vue";
import SchemaBase from "@/ui/components/modals/ManageDevice/schemas/SchemaBase";

/**
 * Scheme to create, modify a specific device.
 * Specified in the device type definition in store/devices/devicesTypes.ts
 */
export default defineComponent({
  components: {
    IconList,
    ComboboxField,
    FirstStepActions,
    SecondStepActions,
    FinalStepActions,
    StepperHeader,
    Step,
    Stepper,
    StepperWindow,
    ExpressionTextArea,
  },
  extends: SchemaBase,
  data() {
    return {
      unit: "",
      interval: "1h",
      intervalOptions: ["1s", "15s", "1m", "15m", "1h"],
    };
  },
  computed: {
    /** steps validation */
    deviceMinMaxBorders() {
      const device = this.devicesTypes[this.deviceData.data.type];
      const arrayOfMappings = Object.entries(device.mappings).filter(
        (field: any) => field[1].minMaxBorders,
      );
      let obj: any = {};
      if (arrayOfMappings.length) {
        arrayOfMappings.forEach(
          (field: any) => (obj = { ...obj, [field[0]]: field[1].minMaxBorders }),
        );
      }
      return obj;
    },
  },
  async created() {
    const copy = JSON.parse(JSON.stringify(this.deviceData));
    this.device = copy;
    if (this.activeRoomId.length && !this.isEditModal)
      this.device.collection_id = this.activeRoomId;
    this.device.data.mappings = this.initMappingsForDevice();
    this.device.data.mappings = { ...this.device.data.mappings, ...this.deviceData.data.mappings };
    if (!this.device.data.meta) this.device.data.meta = {};

    if (this.deviceSchema.unitSelection) {
      this.unit = this.device.data.meta?.unit ?? "";
    }
    if (this.deviceSchema.intervalSelection) {
      this.interval = this.device.data.meta?.interval ?? "";
    }
  },
  methods: {
    /**
     * Save device data in data base
     */
    async sendForm() {
      const copy: any = JSON.parse(JSON.stringify(this.device));

      copy.data.meta.deviceSchema = { ...this.deviceSchema.devicesSchemas };
      copy.data.meta.minMaxBorders = this.deviceMinMaxBorders;

      if (this.deviceSchema.unitSelection) {
        copy.data.meta.unit = this.unit;
      }

      if (this.deviceSchema.intervalSelection) {
        copy.data.meta.interval = this.interval;
      }

      if (this.deviceSchema.iconSelection) {
        const checkIsCoverExist = () =>
          this.device.data?.meta?.cover ? this.device.data?.meta?.cover : null;
        copy.data.meta.cover = this.iconObject ? this.iconObject.id : checkIsCoverExist();
        copy.data.meta.coverType = "icon";
      }

      // add rules
      if (!this.isEditModal) {
        await this.addRulesWhenCreateDevice(copy);
      } else {
        await this.addRulesWhenEditDevice(copy);
      }

      this.$emit("handleControl", copy);
      this.$emit("closeDialog");
    },
  },
});
</script>

<style lang="scss" scoped>
.default-device-schema {
  .optional {
    color: gray;
    font-size: 10px;
    height: 15px;
  }

  .description {
    color: gray;
    font-size: 10px;
  }
}
</style>
