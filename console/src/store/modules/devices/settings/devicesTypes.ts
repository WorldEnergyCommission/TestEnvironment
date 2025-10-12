/**
 * A collection of device schemas with these options:
 * - **mappings** - collection of mappings used in device, are also the form fields in the manage modal form.
 * mapping name consists of Basic Control name and variable.
 * Example: Switch_on: {...} = BasicControl_variable: {...}
 * - **manageSchema** - manage modal form used to create, update device
 * - **isSettingsView** - status whether the device has a settings window
 * - **devicesSchemas** - basicDevices: basic controls which used on device main view;
 *                        additionalBasicDevices: basic controls which used on device settings view;
 */
const devicesTypes = {
  AdamCurve: {
    mappings: {
      Input_actualValue: {
        optional: false,
        type: "ExpressionTextArea",
      },
      Input_optimizedValue: {
        type: "ExpressionTextArea",
        optional: false,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    unitSelection: true,
    devicesSchemas: {
      basicDevices: [],
      additionalBasicDevices: [],
    },
  },
  LightSwitch: {
    mappings: {
      Switch_on: {
        optional: false,
      },
      Switch_off: {
        optional: false,
      },
      Switch_state: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["Switch"],
      additionalBasicDevices: [],
    },
  },
  GeneralSwitchV2: {
    mappings: {
      Switch2V_onOff: {
        optional: false,
      },
      Switch2V_state: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["Switch"],
      additionalBasicDevices: [],
    },
  },
  ImpulseButton: {
    mappings: {
      ImpulseButton_onOff: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    iconSelection: true,
    devicesSchemas: {
      basicDevices: ["Switch"],
      additionalBasicDevices: [],
    },
  },
  Indicator: {
    mappings: {
      Indicator_onOff: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    iconSelection: true,
    devicesSchemas: {
      basicDevices: [],
      additionalBasicDevices: [],
    },
  },
  LightDimmer: {
    mappings: {
      Switch_on: {
        optional: false,
      },
      Switch_off: {
        optional: false,
      },
      Switch_state: {
        optional: false,
      },
      Slider_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 100 },
      },
      OutputField_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 100 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["Switch", "OutputField", "Slider"],
      additionalBasicDevices: [],
    },
  },
  Temperature: {
    mappings: {
      OutputField_actualValue: {
        optional: false,
        minMaxBorders: { min: -100, max: 1500 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["OutputField"],
      additionalBasicDevices: [],
    },
  },
  VariableOutputField: {
    mappings: {
      OutputField_actualValue: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    iconSelection: true,
    unitSelection: true,
    devicesSchemas: {},
  },
  TimeDerivative: {
    mappings: {
      TimeDerivative_sourceVariable: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    iconSelection: true,
    unitSelection: true,
    intervalSelection: true,
    devicesSchemas: {},
  },
  VariableInputField: {
    mappings: {
      InputField_targetValue: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    iconSelection: true,
    unitSelection: true,
    devicesSchemas: {
      basicDevices: ["InputField"],
      additionalBasicDevices: [],
    },
  },
  VariableTextOutputField: {
    mappings: {
      OutputFieldText_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 30 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    iconSelection: true,
    devicesSchemas: {
      basicDevices: ["OutputFieldText"],
      additionalBasicDevices: [],
    },
  },
  VariableTextInputField: {
    mappings: {
      InputFieldText_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 30 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    iconSelection: true,
    devicesSchemas: {
      basicDevices: ["InputFieldText"],
      additionalBasicDevices: [],
    },
  },
  LightRGB: {
    mappings: {
      Switch_on: {
        optional: false,
      },
      Switch_off: {
        optional: false,
      },
      Switch_state: {
        optional: false,
      },
      Slider_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 100 },
      },
      SliderRGB_targetValue_red: {
        optional: false,
        minMaxBorders: { min: 0, max: 255 },
      },
      SliderRGB_targetValue_green: {
        optional: false,
        minMaxBorders: { min: 0, max: 255 },
      },
      SliderRGB_targetValue_blue: {
        optional: false,
        minMaxBorders: { min: 0, max: 255 },
      },
      OutputField1_actualValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 100 },
      },
      OutputField2_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 255 },
      },
      OutputField3_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 255 },
      },
      OutputField4_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 255 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: ["Switch", "SliderRGB", "OutputField2", "OutputField3", "OutputField4"],
      additionalBasicDevices: ["Slider", "OutputField1"],
    },
  },
  LightPushButton: {
    mappings: {
      PushButton_onOff: {
        optional: false,
      },
      PushButton_state: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["PushButton"],
      additionalBasicDevices: [],
    },
  },
  SocketSwitch: {
    mappings: {
      Switch_on: {
        optional: false,
      },
      Switch_off: {
        optional: false,
      },
      Switch_state: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["Switch"],
      additionalBasicDevices: [],
    },
  },
  ControlBlinds: {
    mappings: {
      ArrowUp_up: {
        optional: false,
      },
      ArrowUp_state: {
        optional: false,
      },
      ArrowDown_down: {
        optional: false,
      },
      ArrowDown_state: {
        optional: false,
      },
      DropDown_targetValue: {
        optional: true,
      },
      PushButton_onOff: {
        optional: true,
      },
      PushButton_state: {
        optional: true,
      },
      InputField1_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 600 },
      },
      InputField2_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 600 },
      },
      InputField3_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 10 },
      },
      Slider_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 100 },
      },
      OutputField_actualValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 100 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: ["ArrowUp", "ArrowDown", "Slider", "OutputField", "DropDown"],
      additionalBasicDevices: ["PushButton", "InputField1", "InputField2", "InputField3"],
    },
  },
  ControlAwning: {
    mappings: {
      ArrowOut_out: {
        optional: false,
      },
      ArrowOut_state: {
        optional: false,
      },
      ArrowIn_in: {
        optional: false,
      },
      ArrowIn_state: {
        optional: false,
      },
      PushButton_onOff: {
        optional: true,
      },
      PushButton_state: {
        optional: true,
      },
      InputField1_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 600 },
      },
      InputField2_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 600 },
      },
      Slider_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 100 },
      },
      OutputField_actualValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 100 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: ["ArrowOut", "ArrowIn", "Slider", "OutputField"],
      additionalBasicDevices: ["PushButton", "InputField1", "InputField2"],
    },
  },
  ControlShutter: {
    mappings: {
      ArrowUp_up: {
        optional: false,
      },
      ArrowUp_state: {
        optional: false,
      },
      ArrowDown_down: {
        optional: false,
      },
      ArrowDown_state: {
        optional: false,
      },
      PushButton_onOff: {
        optional: true,
      },
      PushButton_state: {
        optional: true,
      },
      Slider_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 100 },
      },
      OutputField_actualValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 100 },
      },
      InputField1_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 600 },
      },
      InputField2_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 600 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: ["ArrowUp", "ArrowDown", "Slider", "OutputField"],
      additionalBasicDevices: ["PushButton", "InputField1", "InputField2"],
    },
  },
  ThermostatDigital: {
    mappings: {
      Plus_commandPlus: {
        optional: false,
      },
      Minus_commandMinus: {
        optional: false,
      },
      Switch1_on: {
        optional: false,
      },
      Switch1_off: {
        optional: false,
      },
      Switch1_state: {
        optional: false,
      },
      Switch2_on: {
        optional: false,
      },
      Switch2_off: {
        optional: false,
      },
      Switch2_state: {
        optional: false,
      },
      Switch3_on: {
        optional: false,
      },
      Switch3_off: {
        optional: false,
      },
      Switch3_state: {
        optional: false,
      },
      OutputField_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 50 },
      },
      InputField1_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 23 },
      },
      InputField2_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 23 },
      },
      InputField3_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 59 },
      },
      InputField4_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 59 },
      },
      ShowEventDot1_errorWarningState: {
        optional: true,
      },
      ShowEventDot2_errorWarningState: {
        optional: true,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: ["Plus", "Minus", "OutputField", "ShowEventDot1", "ShowEventDot2"],
      additionalBasicDevices: [
        "InputField1",
        "InputField2",
        "InputField3",
        "InputField4",
        "Switch1",
        "Switch2",
        "Switch3",
      ],
    },
  },
  ThermostatAnalog: {
    mappings: {
      InputField1_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 50 },
      },
      InputField2_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 50 },
      },
      InputField3_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 23 },
      },
      InputField4_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 23 },
      },
      InputField5_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 59 },
      },
      InputField6_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 59 },
      },
      Switch1_on: {
        optional: true,
      },
      Switch1_off: {
        optional: true,
      },
      Switch1_state: {
        optional: true,
      },
      Switch2_on: {
        optional: true,
      },
      Switch2_off: {
        optional: true,
      },
      Switch2_state: {
        optional: true,
      },
      Switch3_on: {
        optional: true,
      },
      Switch3_off: {
        optional: true,
      },
      Switch3_state: {
        optional: true,
      },
      ShowEventDot1_errorWarningState: {
        optional: true,
      },
      ShowEventDot2_errorWarningState: {
        optional: true,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: ["InputField1", "ShowEventDot1", "ShowEventDot2"],
      additionalBasicDevices: [
        "InputField2",
        "InputField3",
        "InputField4",
        "InputField5",
        "InputField6",
        "Switch1",
        "Switch2",
        "Switch3",
      ],
    },
  },
  AirHumiditySensor: {
    mappings: {
      OutputField_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 100 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["OutputField"],
      additionalBasicDevices: [],
    },
  },
  BrightnessSensor: {
    mappings: {
      OutputField_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 100 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["OutputField"],
      additionalBasicDevices: [],
    },
  },
  SensorCO2: {
    mappings: {
      OutputField_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 5000 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["OutputField"],
      additionalBasicDevices: [],
    },
  },
  SensorLevel: {
    mappings: {
      OutputField_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 100 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["OutputField"],
      additionalBasicDevices: [],
    },
  },
  WeatherStation: {
    mappings: {
      OutputField1_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 200 },
      },
      OutputField2_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 200 },
      },
      OutputField3_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 200 },
      },
      OutputField4_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 1000 },
      },
      OutputField5_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 100 },
      },
      OutputField6_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 50 },
      },
      OutputField7_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 1 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: [
        "OutputField1",
        "OutputField2",
        "OutputField3",
        "OutputField4",
        "OutputField5",
        "OutputField6",
        "OutputField7",
      ],
      additionalBasicDevices: [],
    },
  },
  HotWaterMeter: {
    mappings: {
      OutputField1_actualValue: {
        optional: false,
      },
      OutputField2_actualValue: {
        optional: true,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: ["OutputField1"],
      additionalBasicDevices: ["OutputField2"],
    },
  },
  ColdWaterMeter: {
    mappings: {
      OutputField1_actualValue: {
        optional: false,
      },
      OutputField2_actualValue: {
        optional: true,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: ["OutputField1"],
      additionalBasicDevices: ["OutputField2"],
    },
  },
  HeatingMeter: {
    mappings: {
      OutputField1_actualValue: {
        optional: false,
      },
      OutputField2_actualValue: {
        optional: false,
      },
      OutputField3_actualValue: {
        optional: true,
      },
      OutputField4_actualValue: {
        optional: true,
      },
      OutputField5_actualValue: {
        optional: true,
      },
      OutputField6_actualValue: {
        optional: true,
      },
      OutputField7_actualValue: {
        optional: true,
      },
      OutputField8_actualValue: {
        optional: true,
      },
      OutputField9_actualValue: {
        optional: true,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: ["OutputField2"],
      additionalBasicDevices: [
        "OutputField1",
        "OutputField3",
        "OutputField4",
        "OutputField5",
        "OutputField6",
        "OutputField7",
        "OutputField8",
        "OutputField9",
      ],
    },
  },
  ElectricityMeter: {
    mappings: {
      OutputField1_actualValue: {
        optional: false,
      },
      OutputField2_actualValue: {
        optional: false,
      },
      OutputField3_actualValue: {
        optional: false,
      },
      OutputField4_actualValue: {
        optional: true,
      },
      OutputField5_actualValue: {
        optional: true,
      },
      OutputField6_actualValue: {
        optional: true,
      },
      OutputField7_actualValue: {
        optional: true,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: ["OutputField1", "OutputField2", "OutputField3"],
      additionalBasicDevices: ["OutputField4", "OutputField5", "OutputField6", "OutputField7"],
    },
  },
  MotionSensor: {
    mappings: {
      InputField_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 1200 },
      },
      Switch_on: {
        optional: false,
      },
      Switch_off: {
        optional: false,
      },
      Switch_state: {
        optional: false,
      },
      PushButton_onOff: {
        optional: false,
      },
      PushButton_state: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["InputField", "Switch", "PushButton"],
      additionalBasicDevices: [],
    },
  },
  Battery: {
    mappings: {
      Battery_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 100 },
      },
      OutputField1_actualValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 1000 },
      },
      OutputField2_actualValue: {
        optional: true,
        minMaxBorders: { min: -30, max: 120 },
      },
      OutputField3_actualValue: {
        optional: true,
        minMaxBorders: { min: -1000, max: 1000 },
      },
      OutputField4_actualValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 100 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: ["Battery"],
      additionalBasicDevices: ["OutputField1", "OutputField2", "OutputField3", "OutputField4"],
    },
  },
  PVSystem: {
    mappings: {
      OutputField_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 1000 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["OutputField"],
      additionalBasicDevices: [],
    },
  },
  HouseConsumption: {
    mappings: {
      OutputField_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 1000 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["OutputField"],
      additionalBasicDevices: [],
    },
  },
  Generator: {
    mappings: {
      OutputField_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 1000 },
      },
      Switch_on: {
        optional: true,
      },
      Switch_off: {
        optional: true,
      },
      Switch_state: {
        optional: true,
      },
      PushButton_onOff: {
        optional: true,
      },
      PushButton_state: {
        optional: true,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: ["OutputField"],
      additionalBasicDevices: ["Switch", "PushButton"],
    },
  },
  MainsConnection: {
    mappings: {
      OutputField_actualValue: {
        optional: false,
        minMaxBorders: { min: -5000, max: 5000 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["OutputField"],
      additionalBasicDevices: [],
    },
  },
  ElectricChargingStation: {
    mappings: {
      OutputField1_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 1000 },
      },
      OutputField2_actualValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 2000 },
      },
      InputField_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 1000 },
      },
      Switch1_on: {
        optional: true,
      },
      Switch1_off: {
        optional: true,
      },
      Switch1_state: {
        optional: true,
      },
      Switch2_on: {
        optional: true,
      },
      Switch2_off: {
        optional: true,
      },
      Switch2_state: {
        optional: true,
      },
      Slider_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 100 },
      },
      OutputField_actualValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 100 },
      },
      ShowEventDot_errorWarningState: {
        optional: true,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: ["OutputField1", "ShowEventDot"],
      additionalBasicDevices: [
        "OutputField2",
        "InputField",
        "Switch1",
        "Switch2",
        "Slider",
        "OutputField",
      ],
    },
  },
  ElectronicBoiler: {
    mappings: {
      OutputField1_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 1000 },
      },
      InputField1_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 23 },
      },
      InputField2_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 23 },
      },
      InputField3_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 59 },
      },
      InputField4_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 59 },
      },
      Switch1_on: {
        optional: true,
      },
      Switch1_off: {
        optional: true,
      },
      Switch1_state: {
        optional: true,
      },
      Switch2_on: {
        optional: true,
      },
      Switch2_off: {
        optional: true,
      },
      Switch2_state: {
        optional: true,
      },
      Slider_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 100 },
      },
      OutputField_actualValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 100 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: ["OutputField1"],
      additionalBasicDevices: [
        "InputField1",
        "InputField2",
        "InputField3",
        "InputField4",
        "Switch1",
        "Switch2",
        "Slider",
        "OutputField",
      ],
    },
  },
  VentilatorSwitch: {
    mappings: {
      Switch_on: {
        optional: false,
      },
      Switch_off: {
        optional: false,
      },
      Switch_state: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["Switch"],
      additionalBasicDevices: [],
    },
  },
  MusicSystem: {
    mappings: {
      Plus_commandPlus: {
        optional: true,
      },
      Minus_commandMinus: {
        optional: true,
      },
      Play_commandPlay: {
        optional: true,
      },
      Stop_commandStop: {
        optional: true,
      },
      Pause_commandPause: {
        optional: true,
      },
      Forward_commandForward: {
        optional: true,
      },
      Reverse_commandReverse: {
        optional: true,
      },
      Switch_on: {
        optional: false,
      },
      Switch_off: {
        optional: false,
      },
      Switch_state: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["Plus", "Minus", "Play", "Stop", "Pause", "Forward", "Reverse", "Switch"],
      additionalBasicDevices: [],
    },
  },
  TV: {
    mappings: {
      Plus_commandPlus: {
        optional: true,
      },
      Minus_commandMinus: {
        optional: true,
      },
      Forward_commandForward: {
        optional: true,
      },
      Reverse_commandReverse: {
        optional: true,
      },
      Switch_on: {
        optional: false,
      },
      Switch_off: {
        optional: false,
      },
      Switch_state: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["Plus", "Minus", "Forward", "Reverse", "Switch"],
      additionalBasicDevices: [],
    },
  },
  MotorWithoutVFD: {
    mappings: {
      PushButton1_onOff: {
        optional: true,
      },
      PushButton1_state: {
        optional: true,
      },
      PushButton2_onOff: {
        optional: true,
      },
      PushButton2_state: {
        optional: true,
      },
      PushButton3_onOff: {
        optional: true,
      },
      PushButton3_state: {
        optional: true,
      },
      PushButton4_onOff: {
        optional: true,
      },
      PushButton4_state: {
        optional: true,
      },
      ArrowLeft_commandLeft: {
        optional: false,
      },
      ArrowLeft_state: {
        optional: false,
      },
      ArrowRight_commandRight: {
        optional: false,
      },
      ArrowRight_state: {
        optional: false,
      },
      OutputField_actualValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 1000 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: [
        "PushButton1",
        "PushButton2",
        "PushButton3",
        "PushButton4",
        "ArrowLeft",
        "ArrowRight",
      ],
      additionalBasicDevices: ["OutputField"],
    },
  },
  PumpWithoutVFD: {
    mappings: {
      PushButton1_onOff: {
        optional: true,
      },
      PushButton1_state: {
        optional: true,
      },
      PushButton2_onOff: {
        optional: true,
      },
      PushButton2_state: {
        optional: true,
      },
      PushButton3_onOff: {
        optional: true,
      },
      PushButton3_state: {
        optional: true,
      },
      PushButton4_onOff: {
        optional: true,
      },
      PushButton4_state: {
        optional: true,
      },
      ArrowLeft_commandLeft: {
        optional: false,
      },
      ArrowLeft_state: {
        optional: false,
      },
      ArrowRight_commandRight: {
        optional: false,
      },
      ArrowRight_state: {
        optional: false,
      },
      OutputField_actualValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 1000 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: [
        "PushButton1",
        "PushButton2",
        "PushButton3",
        "PushButton4",
        "ArrowLeft",
        "ArrowRight",
      ],
      additionalBasicDevices: ["OutputField"],
    },
  },
  MotorWithVFD: {
    mappings: {
      PushButton1_onOff: {
        optional: true,
      },
      PushButton1_state: {
        optional: true,
      },
      PushButton2_onOff: {
        optional: true,
      },
      PushButton2_state: {
        optional: true,
      },
      PushButton3_onOff: {
        optional: true,
      },
      PushButton3_state: {
        optional: true,
      },
      PushButton4_onOff: {
        optional: true,
      },
      PushButton4_state: {
        optional: true,
      },
      ArrowLeft_commandLeft: {
        optional: false,
      },
      ArrowLeft_state: {
        optional: false,
      },
      ArrowRight_commandRight: {
        optional: false,
      },
      ArrowRight_state: {
        optional: false,
      },
      OutputField1_actualValue: {
        optional: true,
      },
      Slider_targetValue: {
        optional: true,
      },
      OutputField_actualValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 1000 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: [
        "PushButton1",
        "PushButton2",
        "PushButton3",
        "PushButton4",
        "ArrowLeft",
        "ArrowRight",
        "OutputField",
        "Slider",
      ],
      additionalBasicDevices: ["OutputField1"],
    },
  },
  PumpWithVFD: {
    mappings: {
      PushButton1_onOff: {
        optional: true,
      },
      PushButton1_state: {
        optional: true,
      },
      PushButton2_onOff: {
        optional: true,
      },
      PushButton2_state: {
        optional: true,
      },
      PushButton3_onOff: {
        optional: true,
      },
      PushButton3_state: {
        optional: true,
      },
      PushButton4_onOff: {
        optional: true,
      },
      PushButton4_state: {
        optional: true,
      },
      ArrowLeft_commandLeft: {
        optional: false,
      },
      ArrowLeft_state: {
        optional: false,
      },
      ArrowRight_commandRight: {
        optional: false,
      },
      ArrowRight_state: {
        optional: false,
      },
      OutputField1_actualValue: {
        optional: true,
      },
      Slider_targetValue: {
        optional: true,
      },
      OutputField_actualValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 1000 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: [
        "PushButton1",
        "PushButton2",
        "PushButton3",
        "PushButton4",
        "ArrowLeft",
        "ArrowRight",
        "OutputField",
        "Slider",
      ],
      additionalBasicDevices: ["OutputField1"],
    },
  },
  MixingValve: {
    mappings: {
      PushButton1_onOff: {
        optional: true,
      },
      PushButton1_state: {
        optional: true,
      },
      PushButton2_onOff: {
        optional: true,
      },
      PushButton2_state: {
        optional: true,
      },
      PushButton3_onOff: {
        optional: true,
      },
      PushButton3_state: {
        optional: true,
      },
      PushButton4_onOff: {
        optional: true,
      },
      PushButton4_state: {
        optional: true,
      },
      Slider_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 100 },
      },
      OutputField_actualValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 100 },
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: [
        "PushButton1",
        "PushButton2",
        "PushButton3",
        "PushButton4",
        "Slider",
        "OutputField",
      ],
      additionalBasicDevices: [],
    },
  },
  Ventilation: {
    mappings: {
      Switch_on: {
        optional: false,
      },
      Switch_off: {
        optional: false,
      },
      Switch_state: {
        optional: false,
      },
      InputField_targetValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 100 },
      },
      OutputField1_actualValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 3000 },
      },
      OutputField2_actualValue: {
        optional: true,
        minMaxBorders: { min: 0, max: 3000 },
      },
      PushButton_onOff: {
        optional: true,
      },
      PushButton_state: {
        optional: true,
      },
      ShowEventDot1_errorWarningState: {
        optional: true,
      },
      ShowEventDot2_errorWarningState: {
        optional: true,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: [
        "Switch",
        "InputField",
        "OutputField1",
        "OutputField2",
        "PushButton",
        "ShowEventDot1",
        "ShowEventDot2",
      ],
      additionalBasicDevices: [],
    },
  },
  Gauge: {
    mappings: {
      CurrentValueGaugeChart_actualValue: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "GaugeSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["CurrentValueGaugeChart"],
      additionalBasicDevices: [],
    },
  },
  DropDownOutputFieldWithVariable: {
    mappings: {
      DropDown_targetValue: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DropDownSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["DropDown"],
      additionalBasicDevices: [],
    },
  },
  DropDownInputFieldWithVariable: {
    mappings: {
      DropDown_targetValue: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: true,
      },
    },
    manageSchema: "DropDownSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["DropDown"],
      additionalBasicDevices: [],
    },
  },
  TSGFrischwasser: {
    mappings: {
      InputField1_targetValue: {
        optional: false,
        minMaxBorders: { min: -999, max: 999 },
      },
      InputField2_targetValue: {
        optional: false,
        minMaxBorders: { min: -999, max: 999 },
      },
      InputField3_targetValue: {
        optional: false,
        minMaxBorders: { min: -999, max: 999 },
      },
      PushButton1_onOff: {
        optional: false,
      },
      PushButton1_state: {
        optional: false,
      },
      PushButton2_onOff: {
        optional: false,
      },
      PushButton2_state: {
        optional: false,
      },
      InputField4_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 10000 },
      },
      InputField5_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 10000 },
      },
      InputField6_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 25000 },
      },
      InputField7_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 23 },
      },
      InputField8_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 59 },
      },
      InputField9_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 23 },
      },
      InputField10_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 59 },
      },
      InputField11_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 60 },
      },
      InputField12_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 10000 },
      },
      InputField13_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 10000 },
      },
      InputField14_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 10000 },
      },
      ShowEventDot1_errorWarningState: {
        optional: false,
      },
      ShowEventDot2_errorWarningState: {
        optional: false,
      },
      OutputField1_actualValue: {
        optional: false,
      },
      OutputField2_actualValue: {
        optional: false,
      },
      OutputField3_actualValue: {
        optional: false,
      },
      OutputField4_actualValue: {
        optional: false,
      },
      OutputField5_actualValue: {
        optional: false,
      },
      DropDown1_targetValue: {
        optional: false,
      },
      DropDown2_targetValue: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: false,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: [
        // reset button
        "PushButton2",
        "ShowEventDot1",
        "ShowEventDot2",
        "OutputField1",
        "OutputField2",
        "OutputField3",
        "OutputField4",
        "OutputField5",
        "DropDown1",
        "DropDown2",
      ],
      additionalBasicDevices: [
        "InputField1",
        "InputField2",
        "InputField3",
        // other button
        "PushButton1",
        "InputField4",
        "InputField5",
        "InputField6",
        "InputField7",
        "InputField8",
        "InputField9",
        "InputField10",
        "InputField11",
        "InputField12",
        "InputField13",
        "InputField14",
      ],
    },
  },
  TSGBrauchwasser: {
    mappings: {
      InputField1_targetValue: {
        optional: false,
        minMaxBorders: { min: -999, max: 999 },
      },
      InputField2_targetValue: {
        optional: false,
        minMaxBorders: { min: -999, max: 999 },
      },
      InputField3_targetValue: {
        optional: false,
        minMaxBorders: { min: -999, max: 999 },
      },
      PushButton1_onOff: {
        optional: false,
      },
      PushButton1_state: {
        optional: false,
      },
      PushButton2_onOff: {
        optional: false,
      },
      PushButton2_state: {
        optional: false,
      },
      InputField4_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 10000 },
      },
      InputField5_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 10000 },
      },
      InputField6_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 25000 },
      },
      InputField7_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 23 },
      },
      InputField8_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 59 },
      },
      InputField9_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 23 },
      },
      InputField10_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 59 },
      },
      InputField11_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 10000 },
      },
      InputField12_targetValue: {
        optional: false,
        minMaxBorders: { min: 0, max: 10000 },
      },
      ShowEventDot1_errorWarningState: {
        optional: false,
      },
      ShowEventDot2_errorWarningState: {
        optional: false,
      },
      OutputField1_actualValue: {
        optional: false,
      },
      OutputField2_actualValue: {
        optional: false,
      },
      OutputField3_actualValue: {
        optional: false,
      },
      DropDown1_targetValue: {
        optional: false,
      },
      DropDown2_targetValue: {
        optional: false,
      },
      ShowEvent_errorWarningState: {
        optional: false,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: [
        // reset Button
        "PushButton2",
        "ShowEventDot1",
        "ShowEventDot2",
        "OutputField1",
        "OutputField2",
        "OutputField3",
        "DropDown1",
        "DropDown2",
      ],
      additionalBasicDevices: [
        "InputField1",
        "InputField2",
        "InputField3",
        // other button
        "PushButton1",
        "InputField4",
        "InputField5",
        "InputField6",
        "InputField7",
        "InputField8",
        "InputField9",
        "InputField10",
        "InputField11",
        "InputField12",
      ],
    },
  },
  EnergyView: {
    mappings: {},
    manageSchema: "EnergySchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: [],
      additionalBasicDevices: [],
    },
  },
  TSGLadestationNotAus: {
    mappings: {
      DropDown1_targetValue: {
        optional: false,
      },
      DropDown2_targetValue: {
        optional: false,
      },
      PushButton_onOff: {
        optional: false,
      },
      PushButton_state: {
        optional: false,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: ["DropDown1", "DropDown2", "ShowEventDot1", "ShowEventDot2", "PushButton"],
      additionalBasicDevices: [],
    },
  },
  KineticPower: {
    mappings: {},
    manageSchema: "KineticPowerSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: [],
      additionalBasicDevices: [],
    },
  },
  TSGModulLadestation: {
    mappings: {
      ShowEventDot_errorWarningState: {
        optional: false,
      },
      // aktulle leistung kW
      OutputField1_actualValue: {
        optional: false,
      },
      // geladene energie der session kWh
      OutputField2_actualValue: {
        optional: false,
      },
      // ladedauer der session min
      OutputField3_actualValue: {
        optional: false,
      },
      // soc %
      OutputField4_actualValue: {
        optional: true,
      },
      // total energy kWh
      OutputField5_actualValue: {
        optional: false,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: [
        "ShowEventDot_errorWarningState",
        "OutputField1_actualValue",
        "OutputField2_actualValue",
        "OutputField3_actualValue",
        "OutputField4_actualValue",
        "OutputField5_actualValue",
      ],
      additionalBasicDevices: [],
    },
  },
  TimeSwitch: {
    mappings: {
      TimeSwitch_on: {
        optional: false,
      },
      TimeSwitch_off: {
        optional: false,
      },
      TimeSwitch_state: {
        optional: true,
      },
      TimeSwitchControls_onOff: {
        optional: false,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    devicesSchemas: {
      basicDevices: ["Switch"],
      additionalBasicDevices: [],
    },
  },
  SSP: {
    mappings: {
      // aktulle leistung kW
      InputBattery_actualValue: {
        optional: false,
      },
      // geladene energie der session kWh
      InputPV_actualValue: {
        optional: false,
      },
      // ladedauer der session min
      InputOutside_actualValue: {
        optional: false,
      },
      // E Charger kW
      OutputECharger_actualValue: {
        optional: false,
      },
      // E Charger Switch ON
      OutputECharger_on: {
        optional: false,
      },
      // E Charger Switch Off
      OutputECharger_off: {
        optional: false,
      },
      // E Charger Switch State
      OutputECharger_state: {
        optional: false,
      },
      // total energy kWh
      OutputSchuko_actualValue: {
        optional: false,
      },
      // Output32A1 leistung kW
      Output32A1_actualValue: {
        optional: false,
      },
      // Output32A1 Switch ON
      Output32A1_on: {
        optional: false,
      },
      // Output32A1 Switch Off
      Output32A1_off: {
        optional: false,
      },
      // Output32A1 State
      Output32A1_state: {
        optional: false,
      },
      // geladene energie der session kWh
      Output32A2_actualValue: {
        optional: false,
      },
      // Output32A2 Switch ON
      Output32A2_on: {
        optional: false,
      },
      // Output32A2 Switch Off
      Output32A2_off: {
        optional: false,
      },
      // Output32A2 State
      Output32A2_state: {
        optional: false,
      },
      // ladedauer der session min
      Output16A_actualValue: {
        optional: false,
      },
      // Output32A2 Switch ON
      Output16A_on: {
        optional: false,
      },
      // Output32A2 Switch Off
      Output16A_off: {
        optional: false,
      },
      // Output32A2 State
      Output16A_state: {
        optional: false,
      },
    },
    manageSchema: "SSPSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: [],
      additionalBasicDevices: [],
    },
  },
  EaseeWallbox: {
    mappings: {},
    manageSchema: "EaseeSchema",
    isSettingsView: false,
    easeeChargerId: true,
  },
  WeekTrendSummary: {
    mappings: {
      // aktulle leistung kW
      Input_actualValue: {
        optional: false,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: false,
    devicesSchemas: {
      basicDevices: [],
      additionalBasicDevices: [],
    },
  },
  LoadManagementList: {
    mappings: {},
    manageSchema: "LoadManagementSchema",
    isSettingsView: false,
    widthSelection: true,
    devicesSchemas: {
      basicDevices: [],
      additionalBasicDevices: [],
    },
  },
};

export default devicesTypes;
