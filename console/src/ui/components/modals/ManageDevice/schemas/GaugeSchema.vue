<!-- eslint-disable vuetify/no-deprecated-components -->
<template>
  <div class="gauge-schema h-100">
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
                    <div class="optional mb-2">
                      <div v-if="deviceMappings[item].optional">Optional</div>
                    </div>
                    <ComboboxField
                      v-model="device.data.mappings[item]"
                      :items="measurementsKeysList"
                      :label="$t(`devices.${deviceData.data.type}.mappings.${item}.label`)"
                      :optional="false"
                    />
                    <div class="description">
                      {{ $t(`devices.${deviceData.data.type}.mappings.${item}.description`) }}
                    </div>
                  </div>
                </CoreColumn>
                <CoreColumn sm="4">
                  <div class="optional mb-2" />
                  <CoreTextField
                    v-model="device.data.meta.unit"
                    hide-details
                    label="Unit"
                    max-length="4"
                  />
                  <div class="description" />
                </CoreColumn>
                <CoreColumn sm="4">
                  <div class="optional mb-2" />
                  <div class="d-flex">
                    <CoreTextField
                      v-model="device.data.meta.scaling.min"
                      hide-details
                      label="Min"
                      type="number"
                    />
                    <CoreTextField
                      v-model="device.data.meta.scaling.max"
                      hide-details
                      label="Max"
                      style="padding-left: 4px"
                      type="number"
                    />
                  </div>
                  <div class="description">
                    <div v-if="!scalingValidation" style="color: red">
                      Min Value can't be higher than the Max Value !
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

import {
  FinalStepActions,
  FirstStepActions,
  SecondStepActions,
} from "@/ui/components/modals/components/Actions";
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
    FirstStepActions,
    SecondStepActions,
    FinalStepActions,
    StepperHeader,
    Step,
    Stepper,
    StepperWindow,
  },
  mixins: [SchemaBase],
  computed: {
    /** steps validation */
    scalingValidation() {
      return +this.device.data.meta.scaling.min < +this.device.data.meta.scaling.max;
    },
  },
  async created() {
    const copy = JSON.parse(JSON.stringify(this.deviceData));

    if (this.activeRoomId.length && !this.isEditModal) copy.collection_id = this.activeRoomId;

    if (!copy.data.meta) {
      copy.data.meta = {
        scaling: {
          min: null,
          max: null,
        },
        unit: "",
      };
    }
    this.device = copy;
    this.device.data.mappings = this.initMappingsForDevice();
    this.device.data.mappings = { ...this.device.data.mappings, ...this.deviceData.data.mappings };
  },
  methods: {
    /**
     * Goes through device mappings list and create options for every item
     * @return form of mappings options
     */
    initMappingsForDevice() {
      let mappingsSchema: any = {};
      Object.keys(this.devicesTypes[this.deviceData.data.type].mappings).forEach((item: string) => {
        mappingsSchema = { ...mappingsSchema, [item]: "" };
      });
      return mappingsSchema;
    },
    /**
     * Save device data in data base
     */
    async sendForm() {
      const copy = JSON.parse(JSON.stringify(this.device));

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

<style lang="scss">
.gauge-schema {
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
