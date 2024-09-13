<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="fresh_water"
    :device-size="$vuetify.display.mobile ? 'x2h' : 'x2h'"
    settings-modal-width="1300"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="d-flex align-center tsg-frischwasser">
        <div class="pr-4" style="width: 50%">
          <LabelUnitWrapper
            :variables-list-for-check="[deviceData.data.mappings.ShowEventDot1_errorWarningState]"
          >
            <template #label> Schwimmerschalter </template>
            <template #value>
              <div class="ma-auto d-flex">
                <ShowEventDotBase
                  :inactive-color="$vuetify.theme.current.colors.error"
                  :items="[[1, $vuetify.theme.current.colors.green]]"
                  :variable-data="deviceData.data.mappings"
                  height="15"
                  instance="ShowEventDot1"
                  width="15"
                  :is-preview="isPreview"
                />
              </div>
            </template>
          </LabelUnitWrapper>
          <LabelUnitWrapper
            :variables-list-for-check="[deviceData.data.mappings.ShowEventDot2_errorWarningState]"
            class="pt-sm-2"
          >
            <template #label> Status Reedkontakt Chemie </template>
            <template #value>
              <div class="ma-auto d-flex">
                <ShowEventDotBase
                  :inactive-color="$vuetify.theme.current.colors.error"
                  :items="[[1, $vuetify.theme.current.colors.green]]"
                  :variable-data="deviceData.data.mappings"
                  height="15"
                  instance="ShowEventDot2"
                  width="15"
                  :is-preview="isPreview"
                />
              </div>
            </template>
          </LabelUnitWrapper>
          <LabelUnitWrapper
            :variables-list-for-check="[deviceData.data.mappings.OutputField1_actualValue]"
            class="pt-sm-2"
          >
            <template #label> Sensorwert Redox Sonde </template>
            <template #value>
              <div class="ma-auto d-flex">
                <OutputFieldBase
                  :is-decimal="true"
                  :max="999"
                  :min="-999"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField1"
                  :is-preview="isPreview"
                />
                <div class="pl-2">mV</div>
              </div>
            </template>
          </LabelUnitWrapper>
          <LabelUnitWrapper
            :variables-list-for-check="[deviceData.data.mappings.OutputField2_actualValue]"
            class="pt-sm-2"
          >
            <template #label> Durchfluss Frischwasser </template>
            <template #value>
              <div class="ma-auto d-flex">
                <OutputFieldBase
                  :is-decimal="true"
                  :max="4294967295"
                  :min="0"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField2"
                  :is-preview="isPreview"
                />
                <div class="pl-2">l/min</div>
              </div>
            </template>
          </LabelUnitWrapper>
          <LabelUnitWrapper
            :variables-list-for-check="[deviceData.data.mappings.OutputField4_actualValue]"
            class="pt-sm-2"
          >
            <template #label> Zählerstand Frischwasser </template>
            <template #value>
              <div class="ma-auto d-flex">
                <OutputFieldBase
                  :is-decimal="true"
                  :max="4294967295"
                  :min="0"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField4"
                  :is-preview="isPreview"
                />
                <div class="pl-2">l</div>
              </div>
            </template>
          </LabelUnitWrapper>
        </div>

        <div style="width: 50%">
          <LabelUnitWrapper
            :variables-list-for-check="[deviceData.data.mappings.OutputField3_actualValue]"
            class="pt-2"
          >
            <template #label> Durchfluss Chemie </template>
            <template #value>
              <div class="ma-auto d-flex">
                <OutputFieldBase
                  :is-decimal="true"
                  :max="4294967295"
                  :min="0"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField3"
                  :is-preview="isPreview"
                />
                <div class="pl-2">l/min</div>
              </div>
            </template>
          </LabelUnitWrapper>
          <LabelUnitWrapper
            :variables-list-for-check="[deviceData.data.mappings.OutputField5_actualValue]"
            class="pt-2"
          >
            <template #label> Zählerstand Chemie </template>
            <template #value>
              <div class="ma-auto d-flex">
                <OutputFieldBase
                  :is-decimal="true"
                  :max="4294967295"
                  :min="0"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField5"
                  :is-preview="isPreview"
                />
                <div class="pl-2">l</div>
              </div>
            </template>
          </LabelUnitWrapper>
          <div class="d-flex pt-2">
            <DropDownBase
              :text-mapping="textMappingError"
              :variable-data="deviceData.data.mappings"
              instance="DropDown2"
              label="Error"
              style="width: 100%"
              :is-preview="isPreview"
            />
          </div>
          <div class="d-flex pt-2">
            <DropDownBase
              :text-mapping="textMappingAlarm"
              :variable-data="deviceData.data.mappings"
              instance="DropDown1"
              label="Alarm"
              style="width: 100%"
              :is-preview="isPreview"
            />
          </div>
          <LabelUnitWrapper
            :variables-list-for-check="[
              deviceData.data.mappings.PushButton2_onOff,
              deviceData.data.mappings.PushButton2_state,
            ]"
            class="pt-2"
          >
            <template #label> Reset </template>
            <template #value>
              <div class="ma-auto d-flex">
                <PushButtonBase
                  :variable-data="deviceData.data.mappings"
                  button-size="30"
                  icon="push_reset"
                  icon-size="20"
                  instance="PushButton2"
                  :is-preview="isPreview"
                />
              </div>
            </template>
          </LabelUnitWrapper>
        </div>
      </div>
    </template>
    <template #settings-view>
      <div class="d-flex tsg-frischwasser-settings-view">
        <div class="tsg-frischwasser-settings-view-side flex-grow-1">
          <div>
            <InputFieldBase
              :description-styles="{ width: '220px' }"
              :field-rules="[rules.required, rulesForInputFields.field999Rule, rules.twoComas]"
              :input-field-styles="{ flexGrow: '1' }"
              :is-decimal="true"
              :max="999"
              :min="-999"
              :step="1"
              :unit-styles="{ width: '80px' }"
              :variable-data="deviceData.data.mappings"
              instance="InputField1"
              :is-preview="isPreview"
            >
              <template #textDescription> Offset Redox Sonde </template>
              <template #unit> mV </template>
            </InputFieldBase>
          </div>
          <div>
            <InputFieldBase
              :description-styles="{ width: '220px' }"
              :field-rules="[rules.required, rulesForInputFields.field999Rule, rules.twoComas]"
              :input-field-styles="{ flexGrow: '1' }"
              :is-decimal="true"
              :max="999"
              :min="-999"
              :step="1"
              :unit-styles="{ width: '80px' }"
              :variable-data="deviceData.data.mappings"
              instance="InputField2"
              :is-preview="isPreview"
            >
              <template #textDescription> Min Wert Redox </template>
              <template #unit> mV </template>
            </InputFieldBase>
          </div>
          <div>
            <InputFieldBase
              :description-styles="{ width: '220px' }"
              :field-rules="[rules.required, rulesForInputFields.field999Rule, rules.twoComas]"
              :input-field-styles="{ flexGrow: '1' }"
              :is-decimal="true"
              :max="999"
              :min="-999"
              :step="1"
              :unit-styles="{ width: '80px' }"
              :variable-data="deviceData.data.mappings"
              instance="InputField3"
              :is-preview="isPreview"
            >
              <template #textDescription> Max Wert Redox </template>
              <template #unit> mV </template>
            </InputFieldBase>
          </div>
          <div>
            <InputFieldBase
              :description-styles="{ width: '220px' }"
              :field-rules="[rules.required, rulesForInputFields.tenThousandRule, rules.twoComas]"
              :input-field-styles="{ flexGrow: '1' }"
              :is-decimal="true"
              :max="10000"
              :min="0"
              :step="1"
              :unit-styles="{ width: '80px' }"
              :variable-data="deviceData.data.mappings"
              instance="InputField4"
              :is-preview="isPreview"
            >
              <template #textDescription> Impulslänge Pumpe </template>
              <template #unit> ms </template>
            </InputFieldBase>
          </div>
          <div>
            <InputFieldBase
              :description-styles="{ width: '220px' }"
              :field-rules="[rules.required, rulesForInputFields.tenThousandRule, rules.twoComas]"
              :input-field-styles="{ flexGrow: '1' }"
              :is-decimal="true"
              :max="10000"
              :min="0"
              :step="1"
              :unit-styles="{ width: '80px' }"
              :variable-data="deviceData.data.mappings"
              instance="InputField5"
              :is-preview="isPreview"
            >
              <template #textDescription> Pausezeit Pumpe </template>
              <template #unit> ms </template>
            </InputFieldBase>
          </div>
          <div>
            <InputFieldBase
              :description-styles="{ width: '220px' }"
              :field-rules="[rules.required, rulesForInputFields.onTimeRule, rules.twoComas]"
              :input-field-styles="{ flexGrow: '1' }"
              :is-decimal="true"
              :max="25000"
              :min="0"
              :step="1"
              :unit-styles="{ width: '80px' }"
              :variable-data="deviceData.data.mappings"
              instance="InputField6"
              :is-preview="isPreview"
            >
              <template #unit> ms </template>
              <template #textDescription> Nachlaufzeit bei Dauer Ein </template>
            </InputFieldBase>
          </div>
          <div class="d-flex justify-space-between">
            <div>Pumpe Dauer Ein statt Impuls</div>
            <div class="pr-3">
              <PushButtonBase
                :variable-data="deviceData.data.mappings"
                button-size="35"
                icon-size="25"
                instance="PushButton1"
                :is-preview="isPreview"
              />
            </div>
          </div>
        </div>
        <div class="tsg-frischwasser-settings-view-side flex-grow-1">
          <div>
            <InputFieldBase
              :description-styles="{ width: '250px' }"
              :field-rules="[rules.required, rulesForInputFields.hourRule]"
              :icon-styles="{ width: '40px' }"
              :input-field-styles="{ flexGrow: '1' }"
              :is-decimal="false"
              :max="23"
              :min="0"
              :step="1"
              :unit-styles="{ width: '80px' }"
              :variable-data="deviceData.data.mappings"
              instance="InputField7"
              :is-preview="isPreview"
            >
              <template #textDescription> On </template>
              <template #unit> h </template>
              <template #icon>
                <CoreIcon class="pt-2" size="18"> far fa-clock </CoreIcon>
              </template>
            </InputFieldBase>
          </div>
          <div>
            <InputFieldBase
              :description-styles="{ width: '250px' }"
              :field-rules="[rules.required, rulesForInputFields.minuteRule]"
              :icon-styles="{ width: '40px' }"
              :input-field-styles="{ flexGrow: '1' }"
              :is-decimal="false"
              :max="59"
              :min="0"
              :step="1"
              :unit-styles="{ width: '80px' }"
              :variable-data="deviceData.data.mappings"
              instance="InputField8"
              :is-preview="isPreview"
            >
              <template #textDescription> On </template>
              <template #unit> min </template>
              <template #icon>
                <CoreIcon class="pt-2" size="18"> far fa-clock </CoreIcon>
              </template>
            </InputFieldBase>
          </div>
          <div>
            <InputFieldBase
              :description-styles="{ width: '250px' }"
              :field-rules="[rules.required, rulesForInputFields.hourRule]"
              :icon-styles="{ width: '40px' }"
              :input-field-styles="{ flexGrow: '1' }"
              :is-decimal="false"
              :max="23"
              :min="0"
              :step="1"
              :unit-styles="{ width: '80px' }"
              :variable-data="deviceData.data.mappings"
              instance="InputField9"
              :is-preview="isPreview"
            >
              <template #textDescription> Off </template>
              <template #unit> h </template>
              <template #icon>
                <CoreIcon class="pt-2" size="18"> far fa-clock </CoreIcon>
              </template>
            </InputFieldBase>
          </div>
          <div>
            <InputFieldBase
              :description-styles="{ width: '250px' }"
              :field-rules="[rules.required, rulesForInputFields.minuteRule]"
              :icon-styles="{ width: '40px' }"
              :input-field-styles="{ flexGrow: '1' }"
              :is-decimal="false"
              :max="59"
              :min="0"
              :step="1"
              :unit-styles="{ width: '80px' }"
              :variable-data="deviceData.data.mappings"
              instance="InputField10"
              :is-preview="isPreview"
            >
              <template #textDescription> Off </template>
              <template #unit> min </template>
              <template #icon>
                <CoreIcon class="pt-2" size="18"> far fa-clock </CoreIcon>
              </template>
            </InputFieldBase>
          </div>
          <div>
            <InputFieldBase
              :description-styles="{ width: '250px' }"
              :field-rules="[rules.required, rulesForInputFields.timeToMaxRule, rules.twoComas]"
              :icon-styles="{ width: '40px' }"
              :input-field-styles="{ flexGrow: '1' }"
              :is-decimal="true"
              :max="60"
              :min="0"
              :step="1"
              :unit-styles="{ width: '80px' }"
              :variable-data="deviceData.data.mappings"
              instance="InputField11"
              :is-preview="isPreview"
            >
              <template #unit> s </template>
              <template #textDescription> Zeitverz. zum regeln auf Max Wert </template>
            </InputFieldBase>
          </div>
          <div>
            <InputFieldBase
              :description-styles="{ width: '250px' }"
              :field-rules="[rules.required, rulesForInputFields.tenThousandRule, rules.twoComas]"
              :icon-styles="{ width: '40px' }"
              :input-field-styles="{ flexGrow: '1' }"
              :is-decimal="true"
              :max="10000"
              :min="0"
              :step="1"
              :unit-styles="{ width: '80px' }"
              :variable-data="deviceData.data.mappings"
              instance="InputField12"
              :is-preview="isPreview"
            >
              <template #unit> l </template>
              <template #textDescription> Max Frischwasser </template>
            </InputFieldBase>
          </div>
          <div>
            <InputFieldBase
              :description-styles="{ width: '250px' }"
              :field-rules="[rules.required, rulesForInputFields.tenThousandRule, rules.twoComas]"
              :icon-styles="{ width: '40px' }"
              :input-field-styles="{ flexGrow: '1' }"
              :is-decimal="true"
              :max="10000"
              :min="0"
              :step="1"
              :unit-styles="{ width: '80px' }"
              :variable-data="deviceData.data.mappings"
              instance="InputField13"
              :is-preview="isPreview"
            >
              <template #unit> l </template>
              <template #textDescription> Max Chemie </template>
            </InputFieldBase>
          </div>
          <div>
            <InputFieldBase
              :description-styles="{ width: '250px' }"
              :field-rules="[rules.required, rulesForInputFields.tenThousandRule, rules.twoComas]"
              :icon-styles="{ width: '40px' }"
              :input-field-styles="{ flexGrow: '1' }"
              :is-decimal="true"
              :max="10000"
              :min="0"
              :step="1"
              :unit-styles="{ width: '80px' }"
              :variable-data="deviceData.data.mappings"
              instance="InputField14"
              :is-preview="isPreview"
            >
              <template #unit> l </template>
              <template #textDescription> Min Chemie 24h </template>
            </InputFieldBase>
          </div>
        </div>
      </div>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import LabelUnitWrapper from "@/ui/components/devices/components/LabelUnitWrapper.vue";
import DropDownBase from "@/ui/components/devices/devices/base/DropDown.vue";
import InputFieldBase from "@/ui/components/devices/devices/base/InputFieldBase.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import PushButtonBase from "@/ui/components/devices/devices/base/PushButtonBase/index.vue";
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { Validation } from "@/ui/mixins/validation";

export default defineComponent({
  components: {
    PushButtonBase,
    OutputFieldBase,
    DropDownBase,
    InputFieldBase,
    ShowEventDotBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  mixins: [Validation, DeviceBase],
  data() {
    return {
      textMappingError: {
        0: "Keine Fehler",
        1: "KL1512 Konfiguration Fehler",
        2: "Redox Sensor AI Fehler",
        3: "Systemzeit Fehler",
        4: "Fehler Ein-Aus Schaltzeit",
      },
      textMappingAlarm: {
        0: "Kein Alarm",
        1: "Zu hoher Frischwasserverbrauch",
        2: "Zu hoher Chemieverbrauch",
        3: "Zu hoher Chemie und Frischwasserverbrauch",
        4: "Chemieverbrauch zu tief",
        5: "Min Wert der Redox Sonde erreicht",
        6: "Max Wert der Redox Sonde erreicht",
        7: "Schwimmerschalter hat ausgelöst",
        8: "Reed Contact Chemiebehälter hat ausgelöst",
      },
      rulesForInputFields: {
        field999Rule: (value: number) =>
          (value >= -999 && value <= 999) || "Value should be between -999 and 999",
        hourRule: (value: number) =>
          (value >= 0 && value <= 23) || "Value should be between 0 and 23",
        minuteRule: (value: number) =>
          (value >= 0 && value <= 59) || "Value should be between 0 and 59",
        tenThousandRule: (value: number) =>
          (value >= 0 && value <= 10000) || "Value should be between 0 and 10000",
        onTimeRule: (value: number) =>
          (value >= 0 && value <= 25000) || "Value should be between 0 and 25000",
        timeToMaxRule: (value: number) =>
          (value >= 0 && value <= 60) || "Value should be between 0 and 60",
      },
    };
  },
});
</script>

<style lang="scss">
.tsg-frischwasser {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-size: 14px;
  @media all and (max-width: 700px) {
    font-size: 12px;
  }
}

.tsg-frischwasser-settings-view {
  width: 100%;
  @media all and (max-width: 930px) {
    flex-direction: column;
  }

  .tsg-frischwasser-settings-view-side {
    &:first-of-type {
      padding-right: 8px;
      @media all and (max-width: 930px) {
        padding-right: 0;
      }
    }
  }
}
</style>
