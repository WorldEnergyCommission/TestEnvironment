<!-- eslint-disable vuetify/no-deprecated-components -->
<template>
  <div class="drop-down-schema h-1000">
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
                      :optional="deviceMappings[item].optional"
                    />
                    <div class="description">
                      {{ $t(`devices.${deviceData.data.type}.mappings.${item}.description`) }}
                    </div>
                  </div>
                </CoreColumn>
                <CoreColumn sm="4">
                  <div>
                    <div class="optional mb-2" />
                    <CoreTextField
                      v-model="device.data.meta.dropDownTexts.DropDown_title"
                      autocomplete="off"
                      hide-details
                      label="Title Dropdown"
                    />
                    <div class="description" />
                  </div>
                </CoreColumn>
              </CoreRow>
              <CoreRow>
                <CoreColumn sm="4">
                  <CoreButton
                    v-if="textMapping.length === 0"
                    button-type="primary"
                    @click="addMapTest"
                  >
                    <template #icon>
                      <lynus-icon color="theme" name="plus" size="20" />
                    </template>
                    {{ $t("modals.manageDevice.dropDownSchema.addTextButton") }}
                  </CoreButton>
                </CoreColumn>
              </CoreRow>
              <CoreRow style="overflow-y: auto; max-height: 420px">
                <CoreColumn
                  v-for="(item, index) in textMapping"
                  :key="index"
                  :cols="$vuetify.display.mobile ? 12 : 4"
                >
                  <CoreButton button-type="delete" @click="() => deleteVariable(index)">
                    {{ $t("modals.manageDevice.dropDownSchema.deleteButton") }}
                  </CoreButton>
                  <CoreButton
                    :style="{
                      visibility: textMapping.length - 1 === index ? 'visible' : 'hidden',
                    }"
                    class="ml-4"
                    button-type="primary"
                    @click="addMapTest"
                  >
                    <template #icon>
                      <lynus-icon color="theme" name="plus" size="20" />
                    </template>
                    {{ $t("modals.manageDevice.dropDownSchema.addTextButton") }}
                  </CoreButton>
                  <CoreTextField
                    v-model="item.key"
                    :label="$t('modals.manageDevice.dropDownSchema.textFieldLabels.valueField')"
                    class="mt-3"
                    hide-details
                  />
                  <CoreTextField
                    v-model="item.value"
                    :label="$t('modals.manageDevice.dropDownSchema.textFieldLabels.textField')"
                    class="pt-1"
                    hide-details
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
            <CoreColumn cols="6" offset="3">
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
                <CoreButton button-type="delete" v-bind="$attrs" @click="removeIcon">
                  {{ $t("modals.manageDevice.form.removeIconButton") }}
                </CoreButton>
              </div>
            </CoreColumn>
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
  },
  mixins: [SchemaBase],
  data() {
    const textMapping: any = [];

    return {
      textMapping,
    };
  },
  async created() {
    const copy = JSON.parse(JSON.stringify(this.deviceData));
    if (this.activeRoomId.length && !this.isEditModal) copy.collection_id = this.activeRoomId;
    if (!this.deviceData.data.meta) {
      copy.data.meta = {
        dropDownTexts: {
          DropDown_title: "",
        },
      };
    } else {
      this.textMapping = copy.data.meta.dropDownTexts.DropDown_textmapping;
      this.makeArrayOfJsonObj();
    }
    this.device = copy;

    // init schema if device create
    this.device.data.mappings = this.initMappingsForDevice();
    this.device.data.mappings = { ...this.device.data.mappings, ...this.deviceData.data.mappings };
  },
  methods: {
    mapToObj(map: any) {
      const obj: any = {};
      // eslint-disable-next-line no-restricted-syntax
      for (const [k, v] of map) obj[k] = v;
      return obj;
    },
    makeArrayOfJsonObj() {
      const convertedArr: any = [];
      Object.keys(this.deviceData.data.meta.dropDownTexts.DropDown_textmapping).forEach(
        (element: any) => {
          convertedArr.push({
            key: element,
            value: this.deviceData.data.meta.dropDownTexts.DropDown_textmapping[element],
          });
        },
      );
      this.textMapping = convertedArr;
    },
    addMapTest() {
      this.textMapping.push({ key: "", value: "" });
    },
    deleteVariable(index: number) {
      this.textMapping.splice(index, 1);
    },
    /**
     * Save device data in data base
     */
    async sendForm() {
      const copy = JSON.parse(JSON.stringify(this.device));

      copy.data.meta.deviceSchema = { ...this.deviceSchema.devicesSchemas };
      copy.data.meta.minMaxBorders = {};

      // icon
      const checkIsCoverExist = () =>
        this.device.data?.meta?.cover ? this.device.data?.meta?.cover : null;
      copy.data.meta.cover = this.iconObject ? this.iconObject.id : checkIsCoverExist();
      copy.data.meta.coverType = "icon";

      // text mappings
      const DropDown_textmapping = new Map();
      Object.values(this.textMapping).forEach((element: any) => {
        DropDown_textmapping.set(element.key, element.value);
      });
      const myJson: any = {};
      myJson.DropDown_textmapping = this.mapToObj(DropDown_textmapping);
      copy.data.meta.dropDownTexts.DropDown_textmapping = this.mapToObj(DropDown_textmapping);

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
.drop-down-schema {
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
