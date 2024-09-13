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
                    color="accent"
                    hide-details
                    max-length="30"
                    variant="outlined"
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
                <CoreColumn cols="12">
                  {{ $t("devices.SSP.mainView.inputs") }}
                </CoreColumn>
                <CoreColumn
                  v-for="(item, index) in sspInputMappings"
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
                    <ComboboxField
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
                <CoreColumn cols="12">
                  {{ $t("devices.SSP.mainView.outputs") }}
                </CoreColumn>
                <CoreColumn
                  v-for="(item, index) in sspOutputsMappings"
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
                    <ComboboxField
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
                <CoreColumn cols="12">
                  {{ $t("devices.SSP.mainView.control") }}
                </CoreColumn>
                <CoreColumn
                  v-for="(item, index) in sspControlMappings"
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
                    <ComboboxField
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
                    color="accent"
                    hide-details
                    hide-selected
                    item-title="name"
                    item-value="id"
                    variant="outlined"
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
  extends: SchemaBase,
  computed: {
    sspInputMappings() {
      return this.deviceMappingsList.filter((x) => x.includes("Input"));
    },
    sspOutputsMappings() {
      return this.deviceMappingsList.filter(
        (x) => x.includes("Output") && x.includes("actualValue"),
      );
    },
    sspControlMappings() {
      return this.deviceMappingsList.filter(
        (x) => x.includes("on") || x.includes("off") || x.includes("state"),
      );
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
  },
  methods: {
    /**
     * Save device data in data base
     */
    async sendForm() {
      const copy: any = JSON.parse(JSON.stringify(this.device));

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
  .v-stepper-window {
    margin: 0px;
  }
  .v-stepper {
    box-shadow: none !important;

    .v-stepper-header {
      box-shadow: none !important;
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
}
</style>
