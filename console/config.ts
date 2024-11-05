import { ThemeDefinition } from "vuetify";

/**
 * interfaces for the whole whitelabel configuration
 */

export interface ThemeConfig {
  light: Partial<ThemeDefinition>;
  dark: Partial<ThemeDefinition>;
}

export interface ChartLimitConfig {
  maxChartVariables: number;
}

export interface EmsLimitConfig {
  maxPvSystemQuantity: number;
  maxGeneratorQuantity: number;
  maxBatteryQuantity: number;
  maxHouseConsumptionQuantity: number;
  maxEvChargingStationQuantity: number;
  maxElectricHeatingElementQuantity: number;
  maxHeatingPumpQuantity: number;
  maxBigConsumerQuantity: number;
}

export interface EnergyViewLimitConfig {
  maxPvSystemQuantity: number;
  maxGeneratorQuantity: number;
  maxBatteryQuantity: number;
  maxHouseConsumptionQuantity: number;
  maxEvChargingStationQuantity: number;
  maxElectricHeatingElementQuantity: number;
  maxHeatingPumpQuantity: number;
  maxBigConsumerQuantity: number;
  maxHeatMeterQuantity: number;
}

export interface SpoLimitConfig {
  maxHeatingAirSystemQuantity: number;
  maxHeatingWaterSystemQuantity: number;
  maxCoolingAirSystemQuantity: number;
  maxCoolingWaterSystemQuantity: number;
  maxHybridWaterSystemQuantity: number;
  maxHybridAirSystemQuantity: number;
}

export interface LimitConfig {
  ems: EmsLimitConfig;
  spo: SpoLimitConfig;
  chart: ChartLimitConfig;
  energy_view: EnergyViewLimitConfig;
}

export interface DeviceLibraryCategoryConfig {
  "Building Automation": string[];
  Charts: string[];
  TSG?: string[];
}

export interface WhitelabelConfig {
  TITLE: string;
  DOMAIN: string;
  MQTT_CERT_FILE_POSTFIX: string;
  LOGO_URL_LIGHT: string;
  LOGO_URL_DARK: string;
  FAVICON_URL: string;
  LOGIN_BACKGROUND: string;
  LOGIN_LOGO: string;
  LOGIN_LOGO_DARK: string;
  PROJECT_OPEN_SUBPAGE: string;
  REALM: string;
  CLIENT_ID: string;
  LOAD_MPC: boolean;
  DEFAULTS_TO_DARKMODE: boolean;
  LIGHT_MAPBOX_STYLE_ID: string;
  DARK_MAPBOX_STYLE_ID: string;
  HOME_SITE_TOP_CONTENT: string;
  THEMES: Record<string, ThemeDefinition>;
  DEVICES: string[];
  MPC_Devices_List: string[];
  SHOW_PROJECT_TYPE_SELECTION: boolean;
  PROJECT_MENU_ENTRIES: string[];
  PROJECT_SETTINGS_ENTRIES: string[];
  WORKBENCH_CATEGORIES: string[];
  WORKBENCH_BUTTONS: string[];
  DEVICE_LIBRARY_CATEGORIES: DeviceLibraryCategoryConfig;
  AIML_LIBRARY_CATEGORIES: string[];
  MAIN_MENU_ENTRIES: string[];
  SETTINGS_MAIL_SUPPORT: string;
  SETTINGS_TERMS_URL: string;
  SETTINGS_IMPRINT_URL: string;
  SETTINGS_DOWNLOAD_LIST: string[];
  SETTINGS_SHOW_WEATHER_SERVICE: boolean;
  DOCUMENTATION_TABS: string[];
  SHOW_PROJECT_INFO: boolean;
  SHOW_CREATE_DEVICE_BUTTON_IN_AREA: boolean;
  LIMITS: LimitConfig;
  ENABLE_GPS_ROUTER: boolean;
  EMAIL_AS_USER: boolean;
  SHOW_HARDWARE_ID: boolean;
  SIDEBAR_BADGE: string;
}

/**
 * All supported whitelabel names
 */
export enum WhitelabelName {
  eneries = "eneries",
  effectas = "effectas",
}

/**
 * The set default values for all configurations
 */
const DEFAULT_WHITELABEL_CONFIG_VALUES = {
  PROJECT_OPEN_SUBPAGE: "/favorites",
  CLIENT_ID: "console",
  LOAD_MPC: true,
  DEFAULTS_TO_DARKMODE: false,
  HOME_SITE_TOP_CONTENT: "MAP", // can be overwritten
  DEVICES: [
    "AirHumiditySensor",
    "Battery",
    "BrightnessSensor",
    "ColdWaterMeter",
    "ControlAwning",
    "ControlBlinds",
    "ControlShutter",
    "DropDownInputFieldWithVariable",
    "DropDownOutputFieldWithVariable",
    "ElectricChargingStation",
    "ElectricityMeter",
    "ElectronicBoiler",
    "EnergyView",
    "Gauge",
    "GeneralSwitchV2",
    "Generator",
    "HeatingMeter",
    "HotWaterMeter",
    "HouseConsumption",
    "ImpulseButton",
    "Indicator",
    "LightDimmer",
    "LightPushButton",
    "LightRGB",
    "LightSwitch",
    "MainsConnection",
    "MixingValve",
    "MotionSensor",
    "MotorWithoutVFD",
    "MotorWithVFD",
    "MusicSystem",
    "PumpWithoutVFD",
    "PumpWithVFD",
    "PVSystem",
    "SensorCO2",
    "SensorLevel",
    "SocketSwitch",
    "Temperature",
    "ThermostatAnalog",
    "ThermostatDigital",
    "TimeDerivative",
    "TimeSwitch",
    "TV",
    "VariableInputField",
    "VariableOutputField",
    "VariableTextInputField",
    "VariableTextOutputField",
    "Ventilation",
    "VentilatorSwitch",
    "WeatherStation",
    "EaseeWallbox",
    "WeekTrendSummary",
  ], // can be overwritten
  SHOW_PROJECT_TYPE_SELECTION: false,
  PROJECT_MENU_ENTRIES: [
    "Favorites",
    "Areas",
    "Workbench",
    "Settings",
    "Rules",
    "Event list",
    "Report",
    "Documents",
  ],
  WORKBENCH_CATEGORIES: ["Devices", "Charts", "Anomaly Detection", "MPC", "DataMappings"],
  WORKBENCH_BUTTONS: ["ManageCharts", "ManageDevice", "ManageAnomalyDetection", "ManageMLModel"],
  PROJECT_SETTINGS_ENTRIES: [
    "General",
    "Downloads",
    "Notification",
    "MQTT",
    "Permissions",
    "Repository",
    "Variables",
    "ElectricityPrice",
    "OperatingHours",
  ],
  DEVICE_LIBRARY_CATEGORIES: {
    "Building Automation": [
      "Energy",
      "Gauges",
      "Multimedia",
      "Light",
      "Sensors",
      "Meters",
      "Motion",
      "Shading",
      "Variable I/O Fields",
      "Sockets",
      "Heating/Cooling",
      "Ventilation",
      "Switch",
    ],
    Charts: ["Line", "Column"],
  }, // can be overwritten
  SETTINGS_DOWNLOAD_LIST: ["Certificate"],
  SETTINGS_SHOW_WEATHER_SERVICE: true,
  SHOW_PROJECT_INFO: true,
  SHOW_CREATE_DEVICE_BUTTON_IN_AREA: true,
  MAIN_MENU_ENTRIES: ["Home", "Documentation", "Benchmarking"],
  DOCUMENTATION_TABS: ["UserManual", "APIDocs"],
  AIML_LIBRARY_CATEGORIES: ["Anomaly Detection", "MPC"],
  MPC_Devices_List: [
    "ConsumptionService",
    "EMS",
    "PVMonitoringService",
    "PVProductionService",
    "SetpointOptimizer",
  ],
  LIMITS: {
    ems: {
      maxPvSystemQuantity: 20,
      maxGeneratorQuantity: 10,
      maxBatteryQuantity: 10,
      maxHouseConsumptionQuantity: 10,
      maxEvChargingStationQuantity: 20,
      maxElectricHeatingElementQuantity: 10,
      maxHeatingPumpQuantity: 10,
      maxBigConsumerQuantity: 10,
    },
    spo: {
      maxHeatingAirSystemQuantity: 20,
      maxHeatingWaterSystemQuantity: 20,
      maxCoolingAirSystemQuantity: 20,
      maxCoolingWaterSystemQuantity: 20,
      maxHybridWaterSystemQuantity: 20,
      maxHybridAirSystemQuantity: 20,
    },
    chart: {
      maxChartVariables: 18,
    },
    energy_view: {
      maxPvSystemQuantity: 10,
      maxGeneratorQuantity: 10,
      maxBatteryQuantity: 10,
      maxHouseConsumptionQuantity: 10,
      maxEvChargingStationQuantity: 10,
      maxElectricHeatingElementQuantity: 10,
      maxHeatingPumpQuantity: 10,
      maxBigConsumerQuantity: 10,
      maxHeatMeterQuantity: 10,
    },
  }, // can be overwritten
  ENABLE_GPS_ROUTER: false,
  SHOW_HARDWARE_ID: false,
  EMAIL_AS_USER: true,
  SIDEBAR_BADGE: "",
} satisfies Partial<WhitelabelConfig>;

/**
 * All supported whitelabel hosts
 */
export enum WhitelabelHost {
  eneries = "console.eneries.com",
  effectas = "console.effectas.com",
}

/**
 * get the correct name for the host
 */
export function getWhitelabelNameForWhitelabelHost(host: WhitelabelHost): WhitelabelName {
  switch (host) {
    case WhitelabelHost.eneries: {
      return WhitelabelName.eneries;
    }
    case WhitelabelHost.effectas: {
      return WhitelabelName.effectas;
    }
  }
}

/**
 * All supported whitelabel apps
 */
export enum WhitelabelApp {
  eneries = "com.eneries.app",
  effectas = "com.effectas.app",
}

/**
 * get the correct name for the app
 */
export function getWhitelabelNameForWhitelabelApp(app: WhitelabelApp): WhitelabelName {
  switch (app) {
    case WhitelabelApp.eneries: {
      return WhitelabelName.eneries;
    }
    case WhitelabelApp.effectas: {
      return WhitelabelName.effectas;
    }
  }
}

/**
 * get the correct config for the name
 */
export function getWhitelabelConfigForWhitelabelName(name: WhitelabelName): WhitelabelConfig {
  switch (name) {
    case WhitelabelName.eneries: {
      return {
        ...DEFAULT_WHITELABEL_CONFIG_VALUES,
        TITLE: "ENERIES",
        DOMAIN: "eneries.com",
        MQTT_CERT_FILE_POSTFIX: "_eneries",
        LOGO_URL_LIGHT: "/images/eneriesDark.svg",
        LOGO_URL_DARK: "/images/eneriesDark.svg",
        FAVICON_URL: "/images/eneries_favicon.ico",
        LOGIN_LOGO: "/images/eneriesLight.svg",
        LOGIN_LOGO_DARK: "/images/eneriesLight.svg",
        LOGIN_BACKGROUND: "/images/login/background-eneries.jpg",
        REALM: "eneries",
        LIGHT_MAPBOX_STYLE_ID: "mattries/cm1gs5k4v002j01qrfkmthrst",
        DARK_MAPBOX_STYLE_ID: "mattries/cm1gs0edd002y01ph1wq38mrr",
        THEMES: {
          light: {
            colors: {
              primary: "#ffffff",
              surface: "#ffffff",
              sideBarColor: "#404251",
              secondary: "#ffffff",
              accent: "#a4cc79",
              accentLight: "#ffffff",
              lynusText: "#525252",
              lynusTextInvert: "#ffffff",
              lynusTextSidebar: "#ffffff",
              projectBackground: "#ffffff",
              deviceBackground: "#ffffff",
              secondaryDeviceBackground: "#D6D6D6",
              dndItemBackground: "#ffffff",
              inactiveItem: "#ffffff",
              activeItem: "#72b73d",
              primaryBorder: "#c6c6c6",
              error: "#E83B3A",
              overlay: "#629d34",
              lynusIcon: "#707070",
              green: "#72b73d",
              borderColoring: "#a4cc79",
            },
          },
          dark: {
            colors: {
              primary: "#404251",
              surface: "#404251",
              sideBarColor: "#404251",
              secondary: "#404251",
              accent: "#a4cc79",
              accentLight: "#ffffff",
              lynusText: "#FFFFFF",
              lynusTextInvert: "#525252",
              lynusTextSidebar: "#FFFFFF",
              projectBackground: "#404251",
              deviceBackground: "#404251",
              secondaryDeviceBackground: "#414141",
              dndItemBackground: "#404251",
              inactiveItem: "#404251",
              activeItem: "#72b73d",
              primaryBorder: "#5f5f5f",
              error: "#E83B3A",
              overlay: "#629d34",
              lynusIcon: "#dbdbdb",
              green: "#72b73d",
              borderColoring: "#a4cc79",
            },
          },
        },
        SETTINGS_MAIL_SUPPORT: "matthias.ries@eneries.com",
        SETTINGS_TERMS_URL: "https://www.eneries.com/agb/",
        SETTINGS_IMPRINT_URL: "https://www.eneries.com/impressum/",
        WORKBENCH_CATEGORIES: [...DEFAULT_WHITELABEL_CONFIG_VALUES.WORKBENCH_CATEGORIES],
        MPC_Devices_List: [...DEFAULT_WHITELABEL_CONFIG_VALUES.MPC_Devices_List, "LoadMonitor"],
      };
    }
    case WhitelabelName.effectas: {
      return {
        ...DEFAULT_WHITELABEL_CONFIG_VALUES,
        TITLE: "Effectas",
        DOMAIN: "effectas.com",
        MQTT_CERT_FILE_POSTFIX: "_effectas",
        LOGO_URL_LIGHT: "/images/effectas_logo_white.svg",
        LOGO_URL_DARK: "/images/effectas_logo_white.svg",
        FAVICON_URL: "/images/effectas_favicon.ico",
        LOGIN_LOGO: "/images/login/logo-effectas_dark.svg",
        LOGIN_LOGO_DARK: "/images/login/logo-effectas_white.svg",
        LOGIN_BACKGROUND: "/images/login/background-effectas.jpg",
        REALM: "effectas",
        LIGHT_MAPBOX_STYLE_ID: "mattries/cm1gs5k4v002j01qrfkmthrst",
        DARK_MAPBOX_STYLE_ID: "mattries/cm1gs0edd002y01ph1wq38mrr",
        THEMES: {
          light: {
            colors: {
              primary: "#ffffff",
              surface: "#ffffff",
              sideBarColor: "#242a7e",
              secondary: "#ffffff",
              accent: "#FF8E01",
              accentLight: "#ffa333",
              lynusText: "#242a7e",
              lynusTextInvert: "#ffffff",
              lynusTextSidebar: "#ffffff",
              projectBackground: "#ffffff",
              deviceBackground: "#ffffff",
              secondaryDeviceBackground: "#9d9d95",
              dndItemBackground: "#ffffff",
              inactiveItem: "#ffffff",
              activeItem: "#ffaf4d",
              primaryBorder: "#9d9d95",
              error: "#E83B3A",
              overlay: "#ffa333",
              lynusIcon: "#242a7e",
              green: "#30BF54",
              borderColoring: "#FF8E01",
            },
          },
          dark: {
            colors: {
              primary: "#242a7e",
              surface: "#242a7e",
              sideBarColor: "#242a7e",
              secondary: "#242a7e",
              accent: "#FF8E01",
              accentLight: "#ffa333",
              lynusText: "#FFFFFF",
              lynusTextInvert: "#242a7e",
              lynusTextSidebar: "#FFFFFF",
              projectBackground: "#242a7e",
              deviceBackground: "#242a7e",
              secondaryDeviceBackground: "#9d9d95",
              dndItemBackground: "#242a7e",
              inactiveItem: "#242a7e",
              activeItem: "#ffaf4d",
              primaryBorder: "#9d9d95",
              error: "#E83B3A",
              overlay: "#ffa333",
              lynusIcon: "#FF8E01",
              green: "#30BF54",
              borderColoring: "#FF8E01",
            },
          },
        },
        SETTINGS_MAIL_SUPPORT: "info@effectas.com",
        SETTINGS_TERMS_URL: "https://www.effectas.com/",
        SETTINGS_IMPRINT_URL: "https://effectas.com/imprint/",
      };
    }
  }
}
