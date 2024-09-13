<template>
  <CoreCard>
    <CoreTabs :key="$i18n.locale" v-model="tab" show-arrows class="tabs-with-space">
      <CoreTab v-for="(item, index) in devicesLibFiltered" :key="index">
        {{ $t(item.locale) }}
      </CoreTab>
    </CoreTabs>
    <CoreWindow v-model="tab" :touch="false">
      <CoreWindowItem v-for="(view, index) in devicesLibFiltered" :key="`t-${index}`">
        <CoreContainer fluid>
          <CoreRow>
            <CoreColumn
              v-for="(item, index) in view.data"
              :key="`c-${index}`"
              cols="12"
              sm="12"
              v-bind="{ ...item.sizes }"
            >
              <component :is="item.device" :is-modal="false" />
            </CoreColumn>
          </CoreRow>
        </CoreContainer>
      </CoreWindowItem>
    </CoreWindow>
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from "vue";

import CircleSpinner from "@/ui/components/components/CenteredCircleSpinner.vue";
import { envDeviceLibraryCategories } from "@/utils/env";

const ImpulseButton = defineAsyncComponent({
  loader: () => import("../devices/ImpulseButton.vue"),
  loadingComponent: CircleSpinner,
});
const Indicator = defineAsyncComponent({
  loader: () => import("../devices/Indicator.vue"),
  loadingComponent: CircleSpinner,
});
const TimeDerivative = defineAsyncComponent({
  loader: () => import("../devices/TimeDerivative.vue"),
  loadingComponent: CircleSpinner,
});
const TimeSwitch = defineAsyncComponent({
  loader: () => import("../devices/TImeSwitch.vue"),
  loadingComponent: CircleSpinner,
});
const AirHumiditySensor = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/AirHumiditySensor.vue"),
  loadingComponent: CircleSpinner,
});
const Battery = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/Battery.vue"),
  loadingComponent: CircleSpinner,
});
const BrightnessSensor = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/BrightnessSensor.vue"),
  loadingComponent: CircleSpinner,
});
const ColdWaterMeter = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/ColdWaterMeter.vue"),
  loadingComponent: CircleSpinner,
});
const ControlAwning = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/ControlAwning.vue"),
  loadingComponent: CircleSpinner,
});
const ControlBlinds = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/ControlBlinds.vue"),
  loadingComponent: CircleSpinner,
});
const ControlShutter = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/ControlShutter.vue"),
  loadingComponent: CircleSpinner,
});
const DropDownInputFieldWithVariablePreview = defineAsyncComponent({
  loader: () =>
    import("@/ui/components/devices/previews/devices/DropDownInputFieldWithVariablePreview.vue"),
  loadingComponent: CircleSpinner,
});
const DropDownOutputFieldWithVariablePreview = defineAsyncComponent({
  loader: () =>
    import("@/ui/components/devices/previews/devices/DropDownOutputFieldWithVariablePreview.vue"),
  loadingComponent: CircleSpinner,
});
const ElectricChargingStation = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/ElectricChargingStation.vue"),
  loadingComponent: CircleSpinner,
});
const ElectricityMeter = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/ElectricityMeter.vue"),
  loadingComponent: CircleSpinner,
});
const ElectronicBoiler = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/ElectronicBoiler.vue"),
  loadingComponent: CircleSpinner,
});
const EnergyView = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/EnergyViewPreview.vue"),
  loadingComponent: CircleSpinner,
});
const Gauge = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/Gauge.vue"),
  loadingComponent: CircleSpinner,
});
const GeneralSwitchV2 = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/GeneralSwitchV2.vue"),
  loadingComponent: CircleSpinner,
});
const Generator = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/Generator.vue"),
  loadingComponent: CircleSpinner,
});
const HeatingMeter = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/HeatingMeter.vue"),
  loadingComponent: CircleSpinner,
});
const HotWaterMeter = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/HotWaterMeter.vue"),
  loadingComponent: CircleSpinner,
});
const HouseConsumption = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/HouseConsumption.vue"),
  loadingComponent: CircleSpinner,
});
const LightDimmer = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/LightDimmer.vue"),
  loadingComponent: CircleSpinner,
});
const LightPushButton = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/LightPushButton.vue"),
  loadingComponent: CircleSpinner,
});
const LightRGB = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/LightRGB.vue"),
  loadingComponent: CircleSpinner,
});
const LightSwitch = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/LightSwitch.vue"),
  loadingComponent: CircleSpinner,
});
const MainsConnection = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/MainsConnection.vue"),
  loadingComponent: CircleSpinner,
});
const MixingValve = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/MixingValve.vue"),
  loadingComponent: CircleSpinner,
});
const MotionSensor = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/MotionSensor.vue"),
  loadingComponent: CircleSpinner,
});
const MotorWithoutVFD = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/MotorWithoutVFD.vue"),
  loadingComponent: CircleSpinner,
});
const MotorWithVFD = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/MotorWithVFD.vue"),
  loadingComponent: CircleSpinner,
});
const MusicSystem = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/MusicSystem.vue"),
  loadingComponent: CircleSpinner,
});
const PumpWithoutVFD = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/PumpWithoutVFD.vue"),
  loadingComponent: CircleSpinner,
});
const PumpWithVFD = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/PumpWithVFD.vue"),
  loadingComponent: CircleSpinner,
});
const PVSystem = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/PVSystem.vue"),
  loadingComponent: CircleSpinner,
});
const SensorCO2 = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/SensorCO2.vue"),
  loadingComponent: CircleSpinner,
});
const SensorLevel = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/SensorLevel.vue"),
  loadingComponent: CircleSpinner,
});
const SocketSwitch = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/SocketSwitch.vue"),
  loadingComponent: CircleSpinner,
});
const Temperature = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/Temperature.vue"),
  loadingComponent: CircleSpinner,
});
const ThermostatAnalog = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/ThermostatAnalog.vue"),
  loadingComponent: CircleSpinner,
});
const ThermostatDigital = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/ThermostatDigital.vue"),
  loadingComponent: CircleSpinner,
});
const TV = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/TV.vue"),
  loadingComponent: CircleSpinner,
});
const VariableInputField = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/VariableInputField.vue"),
  loadingComponent: CircleSpinner,
});
const VariableOutputField = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/VariableOutputField.vue"),
  loadingComponent: CircleSpinner,
});
const VariableTextInputField = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/VariableTextInputField.vue"),
  loadingComponent: CircleSpinner,
});
const VariableTextOutputField = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/VariableTextOutputField.vue"),
  loadingComponent: CircleSpinner,
});
const Ventilation = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/Ventilation.vue"),
  loadingComponent: CircleSpinner,
});
const VentilatorSwitch = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/VentilatorSwitch.vue"),
  loadingComponent: CircleSpinner,
});
const WeatherStation = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/WeatherStation.vue"),
  loadingComponent: CircleSpinner,
});
const WeekTrendSummary = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/previews/devices/WeekTrendSummary.vue"),
  loadingComponent: CircleSpinner,
});

export default defineComponent({
  components: {
    GeneralSwitchV2,
    EnergyView,
    DropDownInputFieldWithVariablePreview,
    DropDownOutputFieldWithVariablePreview,
    Ventilation,
    MixingValve,
    MotorWithVFD,
    PumpWithVFD,
    PumpWithoutVFD,
    MotorWithoutVFD,
    TV,
    MusicSystem,
    VentilatorSwitch,
    ElectronicBoiler,
    VariableTextInputField,
    VariableTextOutputField,
    MotionSensor,
    SensorLevel,
    SensorCO2,
    BrightnessSensor,
    AirHumiditySensor,
    Temperature,
    LightDimmer,
    LightSwitch,
    VariableOutputField,
    VariableInputField,
    LightPushButton,
    SocketSwitch,
    LightRGB,
    ControlBlinds,
    ControlShutter,
    ControlAwning,
    ThermostatDigital,
    ThermostatAnalog,
    WeatherStation,
    HotWaterMeter,
    ColdWaterMeter,
    HeatingMeter,
    ElectricityMeter,
    Gauge,
    Battery,
    PVSystem,
    HouseConsumption,
    Generator,
    MainsConnection,
    ElectricChargingStation,
    ImpulseButton,
    Indicator,
    TimeSwitch,
    TimeDerivative,
    WeekTrendSummary,
  },
  data() {
    return {
      tab: null,
    };
  },
  computed: {
    devicesLib() {
      const defaultSizes: any = { lg: "3", md: "6" };
      return [
        {
          name: "Energy",
          locale: "uiComponents.devicesLibrary.buildingAutomationTabs.energy",
          data: [
            { device: "Battery", sizes: defaultSizes },
            { device: "PVSystem", sizes: defaultSizes },
            { device: "HouseConsumption", sizes: defaultSizes },
            { device: "Generator", sizes: defaultSizes },
            { device: "MainsConnection", sizes: defaultSizes },
            { device: "ElectricChargingStation", sizes: defaultSizes },
            { device: "ElectronicBoiler", sizes: defaultSizes },
            { device: "EnergyView", sizes: { lg: "12", md: "12" } },
            { device: "WeekTrendSummary", sizes: { lg: "12", md: "12" } },
          ],
        },
        {
          name: "Gauges",
          locale: "uiComponents.devicesLibrary.buildingAutomationTabs.gauges",
          data: [{ device: "Gauge", sizes: { lg: "6", md: "12" } }],
        },
        {
          name: "Multimedia",
          locale: "uiComponents.devicesLibrary.buildingAutomationTabs.multimedia",
          data: [
            { device: "MusicSystem", sizes: defaultSizes },
            { device: "TV", sizes: defaultSizes },
          ],
        },
        {
          name: "Light",
          locale: "uiComponents.devicesLibrary.buildingAutomationTabs.light",
          data: [
            { device: "LightDimmer", sizes: defaultSizes },
            { device: "LightSwitch", sizes: defaultSizes },
            { device: "LightRGB", sizes: defaultSizes },
            { device: "LightPushButton", sizes: defaultSizes },
          ],
        },
        {
          name: "Sensors",
          locale: "uiComponents.devicesLibrary.buildingAutomationTabs.sensors",
          data: [
            { device: "AirHumiditySensor", sizes: defaultSizes },
            { device: "BrightnessSensor", sizes: defaultSizes },
            { device: "SensorCO2", sizes: defaultSizes },
            { device: "SensorLevel", sizes: defaultSizes },
            { device: "Temperature", sizes: defaultSizes },
            { device: "Indicator", sizes: defaultSizes },
            { device: "WeatherStation", sizes: defaultSizes },
            { device: "MotionSensor", sizes: defaultSizes },
          ],
        },
        {
          name: "Meters",
          locale: "uiComponents.devicesLibrary.buildingAutomationTabs.meters",
          data: [
            { device: "HotWaterMeter", sizes: defaultSizes },
            { device: "ColdWaterMeter", sizes: defaultSizes },
            { device: "HeatingMeter", sizes: defaultSizes },
            { device: "ElectricityMeter", sizes: defaultSizes },
          ],
        },
        {
          name: "Motion",
          locale: "uiComponents.devicesLibrary.buildingAutomationTabs.motion",
          data: [
            { device: "MotorWithoutVFD", sizes: defaultSizes },
            { device: "MotorWithVFD", sizes: defaultSizes },
            { device: "PumpWithoutVFD", sizes: defaultSizes },
            { device: "PumpWithVFD", sizes: defaultSizes },
            { device: "MixingValve", sizes: defaultSizes },
          ],
        },
        {
          name: "Shading",
          locale: "uiComponents.devicesLibrary.buildingAutomationTabs.shading",
          data: [
            { device: "ControlBlinds", sizes: defaultSizes },
            { device: "ControlShutter", sizes: defaultSizes },
            { device: "ControlAwning", sizes: defaultSizes },
          ],
        },
        {
          name: "Variable I/O Fields",
          locale: "uiComponents.devicesLibrary.buildingAutomationTabs.variableFields",
          data: [
            { device: "VariableOutputField", sizes: defaultSizes },
            { device: "VariableInputField", sizes: defaultSizes },
            { device: "VariableTextOutputField", sizes: defaultSizes },
            { device: "VariableTextInputField", sizes: defaultSizes },
            { device: "DropDownInputFieldWithVariablePreview", sizes: defaultSizes },
            { device: "DropDownOutputFieldWithVariablePreview", sizes: defaultSizes },
            { device: "TimeDerivative", sizes: defaultSizes },
          ],
        },
        {
          name: "Sockets",
          locale: "uiComponents.devicesLibrary.buildingAutomationTabs.sockets",
          data: [{ device: "SocketSwitch", sizes: defaultSizes }],
        },
        {
          name: "Heating/Cooling",
          locale: "uiComponents.devicesLibrary.buildingAutomationTabs.heatingCooling",
          data: [
            { device: "ThermostatDigital", sizes: defaultSizes },
            { device: "ThermostatAnalog", sizes: defaultSizes },
          ],
        },
        {
          name: "Ventilation",
          locale: "uiComponents.devicesLibrary.buildingAutomationTabs.ventilation",
          data: [
            { device: "VentilatorSwitch", sizes: defaultSizes },
            { device: "Ventilation", sizes: defaultSizes },
          ],
        },
        {
          name: "Switch",
          locale: "uiComponents.devicesLibrary.buildingAutomationTabs.switch",
          data: [
            { device: "GeneralSwitchV2", sizes: defaultSizes },
            { device: "ImpulseButton", sizes: defaultSizes },
            { device: "TimeSwitch", sizes: defaultSizes },
          ],
        },
      ];
    },
    devicesLibFiltered() {
      return this.devicesLib.filter((e) =>
        envDeviceLibraryCategories["Building Automation"].includes(e.name),
      );
    },
  },
});
</script>
