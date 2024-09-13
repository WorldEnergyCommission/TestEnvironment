<template>
  <DeviceLayout
    :device-data="deviceData"
    :is-m-p-c-layout="true"
    :show-event-variable="errorWarningMqtt"
    settings-modal-width="1400"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #custom-icon>
      <CoreIcon size="25"> fas fa-chart-bar </CoreIcon>
    </template>
    <template #basic-controls>
      <div class="heating-circuit-optimisation">
        <div class="d-flex justify-center align-center">
          <MinusBase color="#9BE0ED" @handle-minus="handleMinus" />
          <div class="actual-value d-flex px-2">
            <OutputFieldBaseHTTP
              :actual-value-state="actualValueState"
              :is-decimal="true"
              :is-preview="isPreview"
            />
            <span>°C</span>
          </div>
          <PlusBase color="#ED5A24" @handle-plus="handlePlus" />
        </div>
        <div class="d-flex justify-space-between pt-2">
          <div class="d-flex align-center">
            <ShowEventDotBase
              :items="[[1, '#ED5A24']]"
              :variable-data="heatingMqtt"
              height="15"
              instance="ShowEventDot1"
              width="15"
              :is-preview="isPreview"
            />
            <span class="pl-1">{{ $t(`${langPath}.mainView.heating`) }}</span>
          </div>
          <div class="d-flex align-center">
            <ShowEventDotBase
              :variable-data="readyMqtt"
              height="15"
              instance="ShowEventDot2"
              width="15"
              :is-preview="isPreview"
            />
            <span class="pl-1">{{ $t(`${langPath}.mainView.mpcReady`) }}</span>
          </div>
          <div class="d-flex align-center">
            <ShowEventDotBaseHTTP
              :active-message="$t(`${langPath}.mainView.service.on`)"
              :inactive-message="$t(`${langPath}.mainView.service.off`)"
              :state="!serviceTooWarm"
              active-color="#30bf54"
              active-value="1"
              height="15"
              inactive-color="#ED5A24"
              width="15"
            />
          </div>
        </div>
      </div>
    </template>
    <template #settings-view>
      <div class="heating-circuit-optimisation-settings">
        <div class="heating-circuit-optimisation-settings-form">
          <CoreTabs v-model="tab" fixed-tabs show-arrows>
            <CoreTab v-for="(hItem, hIndex) in loweringModeTabs" :key="hIndex">
              {{ hItem.locale[hIndex] }}
            </CoreTab>
          </CoreTabs>

          <CoreWindow v-model="tab">
            <CoreWindowItem>
              <div class="d-flex align-center justify-center" style="min-height: 162px">
                <div style="width: 50%; margin-top: 10px">
                  <div class="heating-circuit-optimisation-settings-field">
                    <InputFieldExternal
                      v-model="loweringModeStarts.hours"
                      :description-styles="{ flexGrow: '1' }"
                      :field-rules="[rules.fieldHours, rules.fieldMoreThanNull, rules.required]"
                      :height="24"
                      :icon-styles="{ width: '50px', textAlign: 'center', paddingTop: '2px' }"
                      :input-field-styles="{ flexGrow: '2' }"
                      :is-decimal="false"
                      :max="23"
                      :min="0"
                      :step="1"
                      :unit-styles="{ width: '50px' }"
                      instance="InputField1"
                      :is-preview="isPreview"
                    >
                      <template #textDescription>
                        {{ $t("uiComponents.form.on") }}
                      </template>
                      <template #unit>
                        {{ $t("uiComponents.form.h") }}
                      </template>
                      <template #icon>
                        <lynus-icon class="icon" name="time" size="20" />
                      </template>
                    </InputFieldExternal>
                  </div>
                  <div class="heating-circuit-optimisation-settings-field">
                    <InputFieldExternal
                      v-model="loweringModeStarts.minutes"
                      :description-styles="{ flexGrow: '1' }"
                      :field-rules="[rules.fieldMinutes, rules.fieldMoreThanNull, rules.required]"
                      :height="24"
                      :icon-styles="{ width: '50px', textAlign: 'center', paddingTop: '2px' }"
                      :input-field-styles="{ flexGrow: '2' }"
                      :is-decimal="false"
                      :max="59"
                      :min="0"
                      :step="1"
                      :unit-styles="{ width: '50px' }"
                      instance="InputField3"
                      :is-preview="isPreview"
                    >
                      <template #textDescription>
                        {{ $t("uiComponents.form.on") }}
                      </template>
                      <template #unit>
                        {{ $t("uiComponents.form.min") }}
                      </template>
                      <template #icon>
                        <lynus-icon class="icon" name="time" size="20" />
                      </template>
                    </InputFieldExternal>
                  </div>
                  <div class="heating-circuit-optimisation-settings-field">
                    <InputFieldExternal
                      v-model="loweringModeEnds.hours"
                      :description-styles="{ flexGrow: '1' }"
                      :field-rules="[rules.fieldHours, rules.fieldMoreThanNull, rules.required]"
                      :height="24"
                      :icon-styles="{ width: '50px', textAlign: 'center', paddingTop: '2px' }"
                      :input-field-styles="{ flexGrow: '2' }"
                      :is-decimal="false"
                      :max="23"
                      :min="0"
                      :step="1"
                      :unit-styles="{ width: '50px' }"
                      instance="InputField2"
                      :is-preview="isPreview"
                    >
                      <template #textDescription>
                        {{ $t("uiComponents.form.off") }}
                      </template>
                      <template #unit>
                        {{ $t("uiComponents.form.h") }}
                      </template>
                      <template #icon>
                        <lynus-icon class="icon" name="time" size="20" />
                      </template>
                    </InputFieldExternal>
                  </div>
                  <div class="heating-circuit-optimisation-settings-field">
                    <InputFieldExternal
                      v-model="loweringModeEnds.minutes"
                      :description-styles="{ flexGrow: '1' }"
                      :field-rules="[rules.fieldMinutes, rules.fieldMoreThanNull, rules.required]"
                      :height="24"
                      :icon-styles="{ width: '50px', textAlign: 'center', paddingTop: '2px' }"
                      :input-field-styles="{ flexGrow: '2' }"
                      :is-decimal="false"
                      :max="59"
                      :min="0"
                      :step="1"
                      :unit-styles="{ width: '50px' }"
                      instance="InputField4"
                      :is-preview="isPreview"
                    >
                      <template #textDescription>
                        {{ $t("uiComponents.form.off") }}
                      </template>
                      <template #unit>
                        {{ $t("uiComponents.form.min") }}
                      </template>
                      <template #icon>
                        <lynus-icon class="icon" name="time" size="20" />
                      </template>
                    </InputFieldExternal>
                  </div>
                </div>
              </div>
            </CoreWindowItem>
            <CoreWindowItem>
              <div class="d-flex justify-center" style="min-height: 162px">
                <div style="width: 50%; margin-top: 10px">
                  <div class="heating-circuit-optimisation-settings-field">
                    <InputFieldExternal
                      v-model="loweringMode"
                      :description-styles="{ width: '300px' }"
                      :field-rules="[
                        rules.required,
                        rules.twoComas,
                        rules.fieldMoreThan5,
                        rules.fieldLessThan30,
                      ]"
                      :height="24"
                      :input-field-styles="{ flexGrow: '1' }"
                      :is-decimal="false"
                      :max="30"
                      :min="5"
                      :step="0.5"
                      :unit-styles="{ width: '50px' }"
                      field-width="50%"
                      instance="InputField4"
                      :is-preview="isPreview"
                    >
                      <template #textDescription>
                        {{
                          $t("mlModel.HeatingCircuitOptimization.settingsView.loweringTemperature")
                        }}
                      </template>
                      <template #unit> °C </template>
                    </InputFieldExternal>
                  </div>
                  <div class="heating-circuit-optimisation-settings-field mt-1">
                    <InputFieldExternal
                      v-model="serviceOffTemperature"
                      :description-styles="{ width: '300px' }"
                      :field-rules="[rules.required, rules.fieldMoreThan15, rules.fieldLessThan20]"
                      :height="24"
                      :input-field-styles="{ flexGrow: '1' }"
                      :is-decimal="false"
                      :max="20"
                      :min="15"
                      :step="1"
                      :unit-styles="{ width: '50px' }"
                      field-width="50%"
                      instance="InputField4"
                      :is-preview="isPreview"
                    >
                      <template #textDescription>
                        {{
                          $t(
                            "mlModel.HeatingCircuitOptimization.settingsView.serviceOffTemperature",
                          )
                        }}
                      </template>
                      <template #unit> °C </template>
                    </InputFieldExternal>
                  </div>
                  <div class="d-flex justify-space-between field">
                    <div>{{ $t(`${langPath}.settingsView.activateLoweringMode`) }}</div>
                    <div>
                      <CoreSwitch
                        v-model="loweringModeActive"
                        hide-details
                        inset
                        @click.capture="handleLoweringModeActive($event)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CoreWindowItem>
            <CoreWindowItem>
              <div class="d-flex justify-center">
                <div class="pt-2" style="min-height: 162px; width: 300px">
                  <CoreSelect
                    v-model="energySavingMode"
                    :items="energySavingModesList"
                    density="compact"
                    flat
                    hide-selected
                    item-title="title"
                    item-value="value"
                    label="Modes"
                    variant="solo"
                    @update:model-value="handleEnergySavingMode($event)"
                  />
                </div>
              </div>
            </CoreWindowItem>
          </CoreWindow>

          <div v-if="tab !== 2" class="heating-circuit-optimisation-settings-form-button">
            <div class="pt-8">
              <CoreButton :disabled="btnValidation" button-type="primary" @click="sendModeSettings">
                <lynus-icon color="theme" name="send" size="20" />
              </CoreButton>
            </div>
          </div>
        </div>
        <div class="bottom">
          <SettingsCharts :device-id="mpcId" :is-preview="isPreview" />
        </div>
      </div>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import InputFieldExternal from "@/ui/components/devices/components/InputFields/InputFieldExternal.vue";
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import MinusBase from "@/ui/components/devices/mpc/base/MinusBase.vue";
import OutputFieldBaseHTTP from "@/ui/components/devices/mpc/base/OutputFieldBase.vue";
import PlusBase from "@/ui/components/devices/mpc/base/PlusBase.vue";
import ShowEventDotBaseHTTP from "@/ui/components/devices/mpc/base/ShowEventDotBase.vue";
import SettingsCharts from "@/ui/components/devices/mpc/HeatingCircuitOptimization/SettingsCharts/index.vue";
import { Validation } from "@/ui/mixins/validation";

/**
 * Component that represent HeatingCircuitOptimization MPC device
 */
export default defineComponent({
  name: "HeatingCircuitOptimization",
  components: {
    SettingsCharts,
    MinusBase,
    PlusBase,
    ShowEventDotBase,
    ShowEventDotBaseHTTP,
    OutputFieldBaseHTTP,
    InputFieldExternal,
    DeviceLayout,
  },
  mixins: [Validation],
  props: {
    deviceData: { type: Object as PropType<IDevice>, required: true },
    isPreview: { type: Boolean, default: false },
  },
  data() {
    const tab: any = null;
    const serviceOffTemperature: any = 15;
    const loweringMode: any = null;
    const normalMode: any = null;
    // default values for modes
    const loweringModeEnds: any = {
      hours: "6",
      minutes: "0",
    };
    const loweringModeStarts: any = {
      hours: "22",
      minutes: "0",
    };
    const actualValueState: any = null;
    const mpc: any = null;

    return {
      isSettingsView: false,
      mpc,
      actualValueState,
      isLoweringMode: false,
      loweringModeStarts,
      loweringModeEnds,
      loweringModeActive: false,
      normalMode,
      loweringMode,
      energySavingMode: null,
      serviceOffTemperature,
      tab,
    };
  },
  computed: {
    energySavingModesList() {
      return [
        {
          title: this.$t(
            "mlModel.HeatingCircuitOptimization.settingsView.energySavingModesList.comfort",
          ),
          value: 0,
        },
        {
          title: this.$t(
            "mlModel.HeatingCircuitOptimization.settingsView.energySavingModesList.balanced",
          ),
          value: 1,
        },
        {
          title: this.$t(
            "mlModel.HeatingCircuitOptimization.settingsView.energySavingModesList.energySaving",
          ),
          value: 2,
        },
      ];
    },
    loweringModeTabs() {
      const locale = this.$t(`${this.langPath}.settingsView.loweringModeTabs`);
      return [{ locale }, { locale }, { locale }];
    },
    langPath() {
      return `mlModel.${this.deviceData.data.type}`;
    },
    btnValidation() {
      const minMax = this.loweringMode < 5 || this.loweringMode > 30;
      const pattern = /^\-?\d+(?:\,|.\d{1,2})?$/;
      const lowMin = this.loweringModeStarts.minutes < 0 || this.loweringModeStarts.minutes > 59;
      const normMin = this.loweringModeEnds.minutes < 0 || this.loweringModeEnds.minutes > 59;
      const lowHours = this.loweringModeStarts.hours < 0 || this.loweringModeStarts.hours > 23;
      const normHours = this.loweringModeEnds.hours < 0 || this.loweringModeEnds.hours > 23;
      const serviceOff = this.serviceOffTemperature < 15 || this.serviceOffTemperature > 20;
      return (
        minMax ||
        !pattern.test(this.loweringMode) ||
        lowMin ||
        lowHours ||
        normHours ||
        normMin ||
        serviceOff
      );
    },
    mpcId() {
      if (this.deviceData) return this.deviceData.id;
      return null;
    },
    heating() {
      return this.deviceData?.data?.meta?.controllerMappings?.newValvePosition;
    },
    ready() {
      return this.deviceData?.data?.meta?.controllerMappings?.mpcReady;
    },
    errorWarningMqtt() {
      return {
        ShowEvent_errorWarningState: this.deviceData?.data?.meta?.controllerMappings?.errorWarning,
      };
    },
    heatingMqtt() {
      return {
        ShowEventDot1_errorWarningState: this.heating,
      };
    },
    readyMqtt() {
      return {
        ShowEventDot2_errorWarningState: this.ready,
      };
    },
    serviceTooWarm() {
      return this.mpc?.data?.meta?.too_warm;
    },
  },
  async mounted() {
    if (!this.isPreview) {
      this.mpc = await this.fetchMPCData(this.deviceData.id);
    }
    // console.log(`HCO (${this.deviceData.name}): `, this.mpc);
    await this.initTimings();
    await this.defineLoweringMode();
    await this.setActualState();
  },
  methods: {
    async setActualState() {
      const { lowering_mode_active } = this.deviceData.data.meta.timing;
      if (typeof lowering_mode_active === "boolean" && lowering_mode_active === false) {
        this.actualValueState = this.normalMode;
      } else {
        this.actualValueState = !this.isLoweringMode ? this.normalMode : this.loweringMode;
      }
    },
    async initTimings() {
      this.normalMode = this.deviceData.data.meta.timing.high_set_temperature;
      this.loweringMode = this.deviceData.data.meta.timing.low_set_temperature;
      this.serviceOffTemperature = this.deviceData.data.meta.timing.stop_heating;
      this.loweringModeStarts.hours = this.deviceData.data.meta.timing.low_set_temperature_start;
      this.loweringModeStarts.minutes =
        this.deviceData.data.meta.timing.low_set_temperature_start_min;
      this.loweringModeEnds.hours = this.deviceData.data.meta.timing.high_set_temperature_start;
      this.loweringModeEnds.minutes =
        this.deviceData.data.meta.timing.high_set_temperature_start_min;
      this.loweringModeActive = this.deviceData.data.meta.timing.lowering_mode_active;
      this.energySavingMode = this.deviceData.data.meta.timing.energy_type;
    },
    async initLoweringModeActive() {
      this.loweringModeActive = this.deviceData.data.meta.timing.lowering_mode_active;
    },
    async defineLoweringMode() {
      const currentHours = new Date().getHours();
      const currentMinutes = new Date().getMinutes();
      const isLoweringHoursEqual = currentHours === +this.loweringModeStarts.hours;
      const isLoweringHours = currentHours > +this.loweringModeStarts.hours;
      const isLoweringMinutes = currentMinutes >= +this.loweringModeStarts.minutes;
      const isStart = () => {
        if (isLoweringHours) return true;
        if (isLoweringHoursEqual) return isLoweringMinutes;
        return false;
      };
      // console.log('isLoweringStarts: ', isStart());
      const isLoweringHoursEqual2 = currentHours === +this.loweringModeEnds.hours;
      const isLoweringHours2 = currentHours < +this.loweringModeEnds.hours;
      const isLoweringMinutes2 = currentMinutes <= +this.loweringModeEnds.minutes;
      const isEnd = () => {
        if (isLoweringHours2) return false;
        if (isLoweringHoursEqual2) return !isLoweringMinutes2;
        return true;
      };
      // console.log('isLoweringEnds: ', isEnd());
      if ((!isStart() && !isEnd()) || (isStart() && !isEnd()) || (isStart() && isEnd()))
        this.isLoweringMode = true;
      else this.isLoweringMode = false;
    },
    async sendModeSettings() {
      const { high_set_temperature, low_set_temperature, lowering_mode_active } =
        this.deviceData.data.meta.timing;

      const newTiming = {
        high_set_temperature,
        high_set_temperature_start: +this.loweringModeEnds.hours,
        high_set_temperature_start_min: +this.loweringModeEnds.minutes,
        low_set_temperature: +this.loweringMode,
        low_set_temperature_start: +this.loweringModeStarts.hours,
        low_set_temperature_start_min: +this.loweringModeStarts.minutes,
        lowering_mode_active,
        stop_heating: +this.serviceOffTemperature,
      };
      const copy = JSON.parse(JSON.stringify(this.deviceData));
      copy.data.meta.timing = newTiming;
      await this.updateMPCTiming(copy);
      await this.defineLoweringMode();
      await this.setActualState();
    },
    async handleLoweringModeActive(e: MouseEvent) {
      e.stopPropagation();
      e.preventDefault();

      const copy = JSON.parse(JSON.stringify(this.deviceData));
      copy.data.meta.timing = {
        ...copy.data.meta.timing,
        lowering_mode_active: !this.loweringModeActive,
      };
      await this.updateMPCTiming(copy);
      await this.initLoweringModeActive();
      await this.setActualState();
    },
    async handleEnergySavingMode(e: MouseEvent) {
      const copy = JSON.parse(JSON.stringify(this.deviceData));
      copy.data.meta.timing = { ...copy.data.meta.timing, energy_type: this.energySavingMode };
      await this.updateMPCTiming(copy);
      await this.initLoweringModeActive();
      await this.setActualState();
    },
    async handleMinus() {
      if (this.actualValueState <= 5) return;
      this.actualValueState -= 0.5;
      const copy = JSON.parse(JSON.stringify(this.deviceData));

      if (!this.isLoweringMode) {
        this.normalMode = this.actualValueState;
        copy.data.meta.timing = {
          ...copy.data.meta.timing,
          ...{ high_set_temperature: this.actualValueState },
        };
        await this.updateMPCTiming(copy);
        this.setReport({
          type: "success",
          message: this.$t("mlModel.HeatingCircuitOptimization.mainView.handleMinusMessage"),
          value: true,
        });
      } else {
        this.loweringMode = this.actualValueState;
        copy.data.meta.timing = {
          ...copy.data.meta.timing,
          ...{ low_set_temperature: this.actualValueState },
        };
        await this.updateMPCTiming(copy);
        this.setReport({
          type: "success",
          message: this.$t("mlModel.HeatingCircuitOptimization.mainView.handleMinusMessage"),
          value: true,
        });
      }
    },
    handlePlus() {
      if (this.actualValueState >= 30) return;
      this.actualValueState += 0.5;
      const copy = JSON.parse(JSON.stringify(this.deviceData));

      if (!this.isLoweringMode) {
        this.normalMode = this.actualValueState;
        copy.data.meta.timing = {
          ...copy.data.meta.timing,
          ...{ high_set_temperature: this.actualValueState },
        };
        this.updateMPCTiming(copy);
      } else {
        this.loweringMode = this.actualValueState;
        copy.data.meta.timing = {
          ...copy.data.meta.timing,
          ...{ low_set_temperature: this.actualValueState },
        };
        this.updateMPCTiming(copy);
      }
    },
    switchSettingsView(setting: boolean) {
      this.isSettingsView = setting;
    },
    fetchMPCData(payload: any): any {
      return this.$store.dispatch("mpc/fetchMPCData", payload);
    },
    updateMPCTiming(payload: any): any {
      return this.$store.dispatch("mpc/updateMPCTiming", payload);
    },
    setReport(payload: any) {
      this.$store.commit("app/setReport", payload);
    },
  },
});
</script>

<style lang="scss">
.heating-circuit-optimisation {
  width: 100%;
  font-size: 12px;

  .actual-value {
    font-size: 20px;
  }
}

.heating-circuit-optimisation-settings {
  min-width: 800px;
  overflow-x: auto;

  .heating-circuit-optimisation-settings-title {
    font-size: 20px;
    text-align: center;
  }

  .heating-circuit-optimisation-settings-form {
    position: relative;

    .heating-circuit-optimisation-settings-form-button {
      position: absolute;
      top: 20%;
      right: 0;
      width: 20%;
      height: 60%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      background-color: rgb(var(--v-theme-deviceBackground));
    }

    .heating-circuit-optimisation-settings-field {
      .unit {
        padding: 0 10px;
        font-size: 20px;
      }

      .icon-wrapper {
        display: flex;
        flex-direction: column;
        padding-right: 10px;
        margin-top: -10px;

        .icon {
          margin-top: 15px;
        }
      }
    }
  }

  .bottom {
    min-height: 600px;
  }

  .v-input--selection-controls {
    margin-top: 0;
  }

  .v-input--selection-controls__input {
    margin-right: 0 !important;
  }

  .v-input__control {
    min-height: 10px !important;
  }

  .v-window {
    background-color: transparent;
  }
}
</style>
