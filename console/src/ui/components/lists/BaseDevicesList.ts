import { defineComponent, defineAsyncComponent } from "vue";

import GridItem from "@/gridLayout/GridItem.vue";
import GridLayout from "@/gridLayout/GridLayout.vue";
import CircleSpinner from "@/ui/components/components/CenteredCircleSpinner.vue";

const HistoryAnomalyDetection = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/anomalyDetection/HistoryAnomalyDetection.vue"),
  loadingComponent: CircleSpinner,
});

const StreamAnomalyDetection = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/anomalyDetection/StreamAnomalyDetection.vue"),
  loadingComponent: CircleSpinner,
});

const Chart = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/charts/charts/index.vue"),
  loadingComponent: CircleSpinner,
});

const AirHumiditySensor = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/AirHumiditySensor.vue"),
  loadingComponent: CircleSpinner,
});
const Battery = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/Battery.vue"),
  loadingComponent: CircleSpinner,
});
const BrightnessSensor = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/BrightnessSensor.vue"),
  loadingComponent: CircleSpinner,
});
const ColdWaterMeter = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/ColdWaterMeter.vue"),
  loadingComponent: CircleSpinner,
});
const ControlAwning = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/ControlAwning.vue"),
  loadingComponent: CircleSpinner,
});
const ControlBlinds = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/ControlBlinds.vue"),
  loadingComponent: CircleSpinner,
});
const ControlShutter = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/ControlShutter.vue"),
  loadingComponent: CircleSpinner,
});
const DropDownInputFieldWithVariable = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/DropDownInputFieldWithVariable.vue"),
  loadingComponent: CircleSpinner,
});
const DropDownOutputFieldWithVariable = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/DropDownOutputFieldWithVariable.vue"),
  loadingComponent: CircleSpinner,
});
const ElectricChargingStation = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/ElectricChargingStation.vue"),
  loadingComponent: CircleSpinner,
});
const ElectricityMeter = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/ElectricityMeter.vue"),
  loadingComponent: CircleSpinner,
});
const ElectronicBoiler = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/ElectronicBoiler.vue"),
  loadingComponent: CircleSpinner,
});
const EnergyView = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/EnergyViewDevice/EnergyView.vue"),
  loadingComponent: CircleSpinner,
});
const Gauge = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/Gauge.vue"),
  loadingComponent: CircleSpinner,
});
const GeneralSwitchV2 = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/GeneralSwitchV2.vue"),
  loadingComponent: CircleSpinner,
});
const Generator = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/Generator.vue"),
  loadingComponent: CircleSpinner,
});
const HeatingMeter = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/HeatingMeter.vue"),
  loadingComponent: CircleSpinner,
});
const HotWaterMeter = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/HotWaterMeter.vue"),
  loadingComponent: CircleSpinner,
});
const HouseConsumption = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/HouseConsumption.vue"),
  loadingComponent: CircleSpinner,
});
const ImpulseButton = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/ImpulseButton.vue"),
  loadingComponent: CircleSpinner,
});
const Indicator = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/Indicator.vue"),
  loadingComponent: CircleSpinner,
});
// Note: KineticPower devices is not user neither works correctly...
// const KineticPower = defineAsyncComponent({
//   loader: () => import("@/ui/components/devices/devices/KineticPowerDevice/KineticPower.vue"),
//   loadingComponent: CircleSpinner,
// });
const LightDimmer = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/LightDimmer.vue"),
  loadingComponent: CircleSpinner,
});
const LightPushButton = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/LightPushButton.vue"),
  loadingComponent: CircleSpinner,
});
const LightRGB = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/LightRGB.vue"),
  loadingComponent: CircleSpinner,
});
const LightSwitch = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/LightSwitch.vue"),
  loadingComponent: CircleSpinner,
});
const MainsConnection = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/MainsConnection.vue"),
  loadingComponent: CircleSpinner,
});
const MixingValve = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/MixingValve.vue"),
  loadingComponent: CircleSpinner,
});
const MotionSensor = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/MotionSensor.vue"),
  loadingComponent: CircleSpinner,
});
const MotorWithoutVFD = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/MotorWithoutVFD.vue"),
  loadingComponent: CircleSpinner,
});
const MotorWithVFD = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/MotorWithVFD.vue"),
  loadingComponent: CircleSpinner,
});
const MusicSystem = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/MusicSystem.vue"),
  loadingComponent: CircleSpinner,
});
const PumpWithoutVFD = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/PumpWithoutVFD.vue"),
  loadingComponent: CircleSpinner,
});
const PumpWithVFD = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/PumpWithVFD.vue"),
  loadingComponent: CircleSpinner,
});
const PVSystem = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/PVSystem.vue"),
  loadingComponent: CircleSpinner,
});
const SensorCO2 = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/SensorCO2.vue"),
  loadingComponent: CircleSpinner,
});
const SensorLevel = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/SensorLevel.vue"),
  loadingComponent: CircleSpinner,
});
const SocketSwitch = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/SocketSwitch.vue"),
  loadingComponent: CircleSpinner,
});
const Temperature = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/Temperature.vue"),
  loadingComponent: CircleSpinner,
});
const ThermostatAnalog = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/ThermostatAnalog.vue"),
  loadingComponent: CircleSpinner,
});
const ThermostatDigital = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/ThermostatDigital.vue"),
  loadingComponent: CircleSpinner,
});
const TimeDerivative = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/TimeDerivative.vue"),
  loadingComponent: CircleSpinner,
});
const TimeSwitch = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/TimeSwitch.vue"),
  loadingComponent: CircleSpinner,
});
const TSGBrauchwasser = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/TSGBrauchwasser.vue"),
  loadingComponent: CircleSpinner,
});
const TSGFrischwasser = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/TSGFrischwasser.vue"),
  loadingComponent: CircleSpinner,
});
const TSGLadestationNotAus = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/TSGLadestationNotAus.vue"),
  loadingComponent: CircleSpinner,
});
const TSGModulLadestation = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/TSGModulLadestation.vue"),
  loadingComponent: CircleSpinner,
});
const TV = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/TV.vue"),
  loadingComponent: CircleSpinner,
});
const VariableInputField = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/VariableInputField.vue"),
  loadingComponent: CircleSpinner,
});
const VariableOutputField = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/VariableOutputField.vue"),
  loadingComponent: CircleSpinner,
});
const VariableTextInputField = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/VariableTextInputField.vue"),
  loadingComponent: CircleSpinner,
});
const VariableTextOutputField = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/VariableTextOutputField.vue"),
  loadingComponent: CircleSpinner,
});
const Ventilation = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/Ventilation.vue"),
  loadingComponent: CircleSpinner,
});
const VentilatorSwitch = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/VentilatorSwitch.vue"),
  loadingComponent: CircleSpinner,
});
const WeatherStation = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/WeatherStation.vue"),
  loadingComponent: CircleSpinner,
});
const ConsumptionService = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/mpc/ConsumptionService/index.vue"),
  loadingComponent: CircleSpinner,
});
const EMS = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/mpc/EMS/EMS.vue"),
  loadingComponent: CircleSpinner,
});
const HeatingCircuitOptimization = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/mpc/HeatingCircuitOptimization/index.vue"),
  loadingComponent: CircleSpinner,
});
const PVMonitoringService = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/mpc/PVMonitoringService/index.vue"),
  loadingComponent: CircleSpinner,
});
const PVProductionService = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/mpc/PVProductionService/index.vue"),
  loadingComponent: CircleSpinner,
});
const SetpointOptimizer = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/mpc/SetpointOptimizer/SPO.vue"),
  loadingComponent: CircleSpinner,
});
const RoomsList = defineAsyncComponent({
  loader: () => import("@/ui/components/lists/RoomsList/index.vue"),
  loadingComponent: CircleSpinner,
});
const ManageRoom = defineAsyncComponent({
  loader: () => import("@/ui/components/modals/ManageRoom.vue"),
  loadingComponent: CircleSpinner,
});
const LoadMonitor = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/mpc/LoadMonitoring/LoadMonitor.vue"),
  loadingComponent: CircleSpinner,
});
const BakingMonitor = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/mpc/LoadMonitoring/Monitors/BakingMonitor.vue"),
  loadingComponent: CircleSpinner,
});

/** new EfficientIO modules */
const EnergyViewModule = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/modules/EnergyViewModule.vue"),
  loadingComponent: CircleSpinner,
});

const SSP = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/SSP.vue"),
  loadingComponent: CircleSpinner,
});

const EaseeWallbox = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/EaseeWallbox.vue"),
});

const WeekTrendSummary = defineAsyncComponent({
  loader: () => import("@/ui/components/devices/devices/WeekTrendSummary.vue"),
  loadingComponent: CircleSpinner,
});

/**
 * Device list mixin used in multiple places to render devices by reflection
 */
export default defineComponent({
  components: {
    AirHumiditySensor,
    Battery,
    BrightnessSensor,
    ColdWaterMeter,
    ConsumptionService,
    ControlAwning,
    ControlBlinds,
    ControlShutter,
    DropDownInputFieldWithVariable,
    DropDownOutputFieldWithVariable,
    ElectricChargingStation,
    ElectricityMeter,
    ElectronicBoiler,
    EMS,
    EnergyView,
    Gauge,
    GeneralSwitchV2,
    Generator,
    GridItem,
    GridLayout,
    HeatingCircuitOptimization,
    HeatingMeter,
    HistoryAnomalyDetection,
    HotWaterMeter,
    HouseConsumption,
    chart: Chart,
    ImpulseButton,
    Indicator,
    // KineticPower,
    LightDimmer,
    LightPushButton,
    LightRGB,
    LightSwitch,
    MainsConnection,
    ManageRoom,
    MixingValve,
    MotionSensor,
    MotorWithoutVFD,
    MotorWithVFD,
    MusicSystem,
    PumpWithoutVFD,
    PumpWithVFD,
    PVMonitoringService,
    PVProductionService,
    PVSystem,
    RoomsList,
    SensorCO2,
    SensorLevel,
    SetpointOptimizer,
    SocketSwitch,
    SSP,
    StreamAnomalyDetection,
    Temperature,
    ThermostatAnalog,
    ThermostatDigital,
    TimeDerivative,
    TimeSwitch,
    TSGBrauchwasser,
    TSGFrischwasser,
    TSGLadestationNotAus,
    TSGModulLadestation,
    TV,
    VariableInputField,
    VariableOutputField,
    VariableTextInputField,
    VariableTextOutputField,
    Ventilation,
    VentilatorSwitch,
    WeatherStation,
    WeekTrendSummary,
    // New Modules
    EnergyViewModule,
    LoadMonitor,
    BakingMonitor,
    EaseeWallbox,
  },
});
