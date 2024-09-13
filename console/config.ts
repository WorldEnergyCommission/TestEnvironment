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
  efficientio = "efficientio",
  dev = "dev",
  tsg = "tsg",
  peneder = "peneder",
  be = "be",
  powerlink = "powerlink",
  smartsitepower = "smartsitepower",
  bms = "bms",
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
  efficientio = "console.efficientio.com",
  dev = "console.efficientio.io",
  tsg = "console.tsg-portal.de",
  peneder = "connect.peneder.com",
  be = "be-leo-business.burgenlandenergie.at",
  powerlink = "console.power-link.at",
  smartsitepower = "console.smartsitepower.com",
  bms = "console.bmsystems.at",
  effectas = "console.effectas.com",
}

/**
 * get the correct name for the host
 */
export function getWhitelabelNameForWhitelabelHost(host: WhitelabelHost): WhitelabelName {
  switch (host) {
    case WhitelabelHost.efficientio: {
      return WhitelabelName.efficientio;
    }
    case WhitelabelHost.dev: {
      return WhitelabelName.dev;
    }
    case WhitelabelHost.tsg: {
      return WhitelabelName.tsg;
    }
    case WhitelabelHost.peneder: {
      return WhitelabelName.peneder;
    }
    case WhitelabelHost.be: {
      return WhitelabelName.be;
    }
    case WhitelabelHost.powerlink: {
      return WhitelabelName.powerlink;
    }
    case WhitelabelHost.smartsitepower: {
      return WhitelabelName.smartsitepower;
    }
    case WhitelabelHost.bms: {
      return WhitelabelName.bms;
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
  efficientio = "com.efficientio.app",
  dev = "com.dev.efficientio.app",
  tsg = "com.tsgprotect.app",
  peneder = "com.peneder.app",
  bms = "com.bmsystems.app",
  be = "at.burgenlandenergie.leo.app",
  powerlink = "com.powerlink.efficientio.app",
  smartsitepower = "com.smartsitepower.efficientio.app",
  effectas = "com.effectas.app",
}

/**
 * get the correct name for the app
 */
export function getWhitelabelNameForWhitelabelApp(app: WhitelabelApp): WhitelabelName {
  switch (app) {
    case WhitelabelApp.efficientio: {
      return WhitelabelName.efficientio;
    }
    case WhitelabelApp.dev: {
      return WhitelabelName.dev;
    }
    case WhitelabelApp.tsg: {
      return WhitelabelName.tsg;
    }
    case WhitelabelApp.peneder: {
      return WhitelabelName.peneder;
    }
    case WhitelabelApp.bms: {
      return WhitelabelName.bms;
    }
    case WhitelabelApp.be: {
      return WhitelabelName.be;
    }
    case WhitelabelApp.powerlink: {
      return WhitelabelName.powerlink;
    }
    case WhitelabelApp.smartsitepower: {
      return WhitelabelName.smartsitepower;
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
    case WhitelabelName.efficientio: {
      return {
        ...DEFAULT_WHITELABEL_CONFIG_VALUES,
        TITLE: "Efficient IO",
        DOMAIN: "efficientio.com",
        MQTT_CERT_FILE_POSTFIX: "_efficientio",
        LOGO_URL_LIGHT: "/images/efficientIODark.svg",
        LOGO_URL_DARK: "/images/efficientIODark.svg",
        FAVICON_URL: "/images/efficientio_favicon.ico",
        LOGIN_LOGO: "/images/login/logo-efficientio.svg",
        LOGIN_LOGO_DARK: "/images/efficientIODark.svg",
        LOGIN_BACKGROUND: "/images/login/background-efficientio.jpg",
        REALM: "efficientio",
        LIGHT_MAPBOX_STYLE_ID: "m-schwarzmann/cl123p5ts003s14o2ld3zb3p3",
        DARK_MAPBOX_STYLE_ID: "m-schwarzmann/cl124rh1p001914l9xpeklwkr",
        THEMES: {
          light: {
            colors: {
              primary: "#ffffff",
              surface: "#ffffff",
              sideBarColor: "#15202d",
              secondary: "#ffffff",
              accent: "#03e0b6",
              accentLight: "#ffffff",
              lynusText: "#525252",
              lynusTextInvert: "#ffffff",
              lynusTextSidebar: "#ffffff",
              projectBackground: "#ffffff",
              deviceBackground: "#ffffff",
              secondaryDeviceBackground: "#D6D6D6",
              dndItemBackground: "#ffffff",
              inactiveItem: "#ffffff",
              activeItem: "#68ecd3",
              primaryBorder: "#c6c6c6",
              error: "#E83B3A",
              overlay: "#02b392",
              lynusIcon: "#707070",
              green: "#30BF54",
              borderColoring: "#03e0b6",
            },
          },
          dark: {
            colors: {
              primary: "#15202d",
              surface: "#15202d",
              sideBarColor: "#15202d",
              secondary: "#15202d",
              accent: "#03e0b6",
              accentLight: "#ffffff",
              lynusText: "#FFFFFF",
              lynusTextInvert: "#525252",
              lynusTextSidebar: "#FFFFFF",
              projectBackground: "#15202d",
              deviceBackground: "#15202d",
              secondaryDeviceBackground: "#414141",
              dndItemBackground: "#15202d",
              inactiveItem: "#15202d",
              activeItem: "#02866d",
              primaryBorder: "#5f5f5f",
              error: "#E83B3A",
              overlay: "#02b392",
              lynusIcon: "#dbdbdb",
              green: "#30BF54",
              borderColoring: "#03e0b6",
            },
          },
        },
        SETTINGS_MAIL_SUPPORT: "support@efficientio.com",
        SETTINGS_TERMS_URL: "https://www.efficientio.com/agb/",
        SETTINGS_IMPRINT_URL: "https://www.efficientio.com/impressum/",
        WORKBENCH_CATEGORIES: [...DEFAULT_WHITELABEL_CONFIG_VALUES.WORKBENCH_CATEGORIES],
        MPC_Devices_List: [...DEFAULT_WHITELABEL_CONFIG_VALUES.MPC_Devices_List, "LoadMonitor"],
      };
    }
    case WhitelabelName.dev: {
      return {
        ...DEFAULT_WHITELABEL_CONFIG_VALUES,
        TITLE: "Efficient IO - DEV",
        DOMAIN: "efficientio.io",
        MQTT_CERT_FILE_POSTFIX: "_dev",
        LOGO_URL_LIGHT: "/images/dev_logo_dark.svg",
        LOGO_URL_DARK: "/images/dev_logo_dark.svg",
        FAVICON_URL: "/images/dev_favicon.ico",
        LOGIN_LOGO: "/images/dev_logo.svg",
        LOGIN_LOGO_DARK: "/images/dev_logo_dark.svg",
        LOGIN_BACKGROUND: "/images/login/background-dev.jpg",
        REALM: "dev",
        LIGHT_MAPBOX_STYLE_ID: "m-schwarzmann/clb15dl1m001b16o500e6asrd",
        DARK_MAPBOX_STYLE_ID: "m-schwarzmann/clb15fk8j001l14qu3jjia900",
        THEMES: {
          light: {
            colors: {
              primary: "#ffffff",
              surface: "#ffffff",
              sideBarColor: "#15202d",
              secondary: "#ffffff",
              accent: "#FF9D00",
              accentLight: "#ffd899",
              lynusText: "#15202d",
              lynusTextInvert: "#ffffff",
              lynusTextSidebar: "#ffffff",
              projectBackground: "#ffffff",
              deviceBackground: "#ffffff",
              secondaryDeviceBackground: "#D6D6D6",
              dndItemBackground: "#ffffff",
              inactiveItem: "#ffffff",
              activeItem: "#ffbb4d",
              primaryBorder: "#D6D6D6",
              error: "#E83B3A",
              overlay: "#ffd899",
              lynusIcon: "#15202d",
              green: "#30BF54",
              borderColoring: "#FF9D00",
            },
          },
          dark: {
            colors: {
              primary: "#15202d",
              surface: "#15202d",
              sideBarColor: "#15202d",
              secondary: "#15202d",
              accent: "#FF9D00",
              accentLight: "#ffd899",
              lynusText: "#FFFFFF",
              lynusTextInvert: "#15202d",
              lynusTextSidebar: "#FFFFFF",
              projectBackground: "#15202d",
              deviceBackground: "#15202d",
              secondaryDeviceBackground: "#D6D6D6",
              dndItemBackground: "#15202d",
              inactiveItem: "#15202d",
              activeItem: "#ffbb4d",
              primaryBorder: "#D6D6D6",
              error: "#E83B3A",
              overlay: "#ffd899",
              lynusIcon: "#FF9D00",
              green: "#30BF54",
              borderColoring: "#FF9D00",
            },
          },
        },
        DEVICES: [
          ...DEFAULT_WHITELABEL_CONFIG_VALUES.DEVICES,
          "TSGFrischwasser",
          "TSGBrauchwasser",
          "TSGLadestationNotAus",
          "TSGModulLadestation",
          "SSP",
        ],
        MPC_Devices_List: [...DEFAULT_WHITELABEL_CONFIG_VALUES.MPC_Devices_List, "LoadMonitor"],
        DEVICE_LIBRARY_CATEGORIES: {
          ...DEFAULT_WHITELABEL_CONFIG_VALUES.DEVICE_LIBRARY_CATEGORIES,
          TSG: ["TSG Devices"],
        },
        SETTINGS_MAIL_SUPPORT: "development@efficientio.com",
        SETTINGS_TERMS_URL: "https://www.efficientio.com/agb/",
        SETTINGS_IMPRINT_URL: "https://www.efficientio.com/impressum/",
        ENABLE_GPS_ROUTER: true,
        WORKBENCH_CATEGORIES: [
          ...DEFAULT_WHITELABEL_CONFIG_VALUES.WORKBENCH_CATEGORIES, // "Modules"
        ],
        SHOW_HARDWARE_ID: true,
        PROJECT_SETTINGS_ENTRIES: [...DEFAULT_WHITELABEL_CONFIG_VALUES.PROJECT_SETTINGS_ENTRIES],
        PROJECT_MENU_ENTRIES: [
          ...DEFAULT_WHITELABEL_CONFIG_VALUES.PROJECT_MENU_ENTRIES,
          "Charging",
        ],
      };
    }
    case WhitelabelName.tsg: {
      return {
        ...DEFAULT_WHITELABEL_CONFIG_VALUES,
        TITLE: "TSG",
        DOMAIN: "tsg-portal.de",
        MQTT_CERT_FILE_POSTFIX: "_tsg",
        LOGO_URL_LIGHT: "/images/tsg.svg",
        LOGO_URL_DARK: "/images/tsg.svg",
        FAVICON_URL:
          "https://www.tsg-solutions.com/app/themes/tsg-ssd-theme/dist/images/favicon/favicon.ico",
        LOGIN_LOGO: "/images/login/logo-tsg.svg",
        LOGIN_LOGO_DARK: "/images/login/logo-tsg.svg",
        LOGIN_BACKGROUND: "/images/login/background-tsg.jpg",
        REALM: "tsg",
        LIGHT_MAPBOX_STYLE_ID: "m-schwarzmann/cl3wmm5yx002g14ryf49v4xd1",
        DARK_MAPBOX_STYLE_ID: "m-schwarzmann/cl3wmm5yx002g14ryf49v4xd1",
        THEMES: {
          light: {
            colors: {
              primary: "#ffffff",
              surface: "#ffffff",
              sideBarColor: "#1a1a1a",
              secondary: "#e4f4ff",
              accent: "#EF414B",
              accentLight: "#525252",
              lynusText: "#525252",
              lynusTextInvert: "#FFFFFF",
              lynusTextSidebar: "#FFFFFF",
              projectBackground: "#f2f2f2",
              deviceBackground: "#f2f2f2",
              secondaryDeviceBackground: "#D6D6D6",
              dndItemBackground: "#E4F4FF",
              inactiveItem: "#eaeaea",
              activeItem: "#f7b7ba",
              primaryBorder: "#c6c6c6",
              error: "#E83B3A",
              overlay: "#FBD0D2",
              lynusIcon: "#707070",
              green: "#30BF54",
              borderColoring: "#EF414B",
            },
          },
          dark: {
            colors: {
              primary: "#171717",
              surface: "#171717",
              sideBarColor: "#1a1a1a",
              secondary: "#313131",
              accent: "#eb121e",
              accentLight: "#E4F4FF",
              lynusText: "#FFFFFF",
              lynusTextInvert: "#525252",
              lynusTextSidebar: "#FFFFFF",
              projectBackground: "#313131",
              deviceBackground: "#313131",
              secondaryDeviceBackground: "#414141",
              dndItemBackground: "#313131",
              inactiveItem: "#313131",
              activeItem: "#eb121e",
              primaryBorder: "#5f5f5f",
              error: "#E83B3A",
              overlay: "#FBD0D2",
              lynusIcon: "#dbdbdb",
              green: "#30BF54",
              borderColoring: "#eb121e",
            },
          },
        },
        SETTINGS_MAIL_SUPPORT: "support-de@tsg-solutions.com",
        SETTINGS_TERMS_URL: "https://www.tsg-solutions.com/de/agb/",
        SETTINGS_IMPRINT_URL: "https://www.tsg-solutions.com/de/impressum/",
        DEVICES: [
          ...DEFAULT_WHITELABEL_CONFIG_VALUES.DEVICES,
          "TSGFrischwasser",
          "TSGBrauchwasser",
          "TSGLadestationNotAus",
          "TSGModulLadestation",
        ],
        DEVICE_LIBRARY_CATEGORIES: {
          ...DEFAULT_WHITELABEL_CONFIG_VALUES.DEVICE_LIBRARY_CATEGORIES,
          TSG: ["TSG Devices"],
        },
        LIMITS: {
          ...DEFAULT_WHITELABEL_CONFIG_VALUES.LIMITS,
          ems: {
            ...DEFAULT_WHITELABEL_CONFIG_VALUES.LIMITS.ems,
            maxEvChargingStationQuantity: 200,
          },
        },
        EMAIL_AS_USER: false,
      };
    }
    case WhitelabelName.peneder: {
      return {
        ...DEFAULT_WHITELABEL_CONFIG_VALUES,
        TITLE: "P_Connect",
        DOMAIN: "connect.peneder.com",
        MQTT_CERT_FILE_POSTFIX: "_peneder",
        LOGO_URL_LIGHT: "/images/peneder_logo_white.svg",
        LOGO_URL_DARK: "/images/peneder_logo_white.svg",
        FAVICON_URL: "/images/peneder_favicon.ico",
        LOGIN_LOGO: "/images/login/logo-peneder.svg",
        LOGIN_LOGO_DARK: "/images/peneder_logo_white.svg",
        LOGIN_BACKGROUND: "/images/login/background-peneder.jpg",
        REALM: "peneder",
        LIGHT_MAPBOX_STYLE_ID: "m-schwarzmann/clb15uqtz005d14rxzihxn1x8",
        DARK_MAPBOX_STYLE_ID: "m-schwarzmann/clb15w1mr002x15nwe29tozpz",
        THEMES: {
          light: {
            colors: {
              primary: "#ffffff",
              surface: "#ffffff",
              sideBarColor: "#222c37",
              secondary: "#ffffff",
              accent: "#ed1834",
              accentLight: "#ffffff",
              lynusText: "#222c37",
              lynusTextInvert: "#ffffff",
              lynusTextSidebar: "#ffffff",
              projectBackground: "#ffffff",
              deviceBackground: "#ffffff",
              secondaryDeviceBackground: "#D6D6D6",
              dndItemBackground: "#ffffff",
              inactiveItem: "#ffffff",
              activeItem: "#f0465c",
              primaryBorder: "#646b73",
              error: "#E83B3A",
              overlay: "#f47485",
              lynusIcon: "#222c37",
              green: "#30BF54",
              borderColoring: "#ed1834",
            },
          },
          dark: {
            colors: {
              primary: "#222c37",
              surface: "#222c37",
              sideBarColor: "#222c37",
              secondary: "#222c37",
              accent: "#ed1834",
              accentLight: "#ffffff",
              lynusText: "#FFFFFF",
              lynusTextInvert: "#222c37",
              lynusTextSidebar: "#FFFFFF",
              projectBackground: "#222c37",
              deviceBackground: "#222c37",
              secondaryDeviceBackground: "#414141",
              dndItemBackground: "#222c37",
              inactiveItem: "#222c37",
              activeItem: "#f0465c",
              primaryBorder: "#646b73",
              error: "#E83B3A",
              overlay: "#f47485",
              lynusIcon: "#FFFFFF",
              green: "#30BF54",
              borderColoring: "#ed1834",
            },
          },
        },
        SETTINGS_MAIL_SUPPORT: "connect@peneder.com",
        SETTINGS_TERMS_URL: "https://www.peneder.com/de-at/agb/",
        SETTINGS_IMPRINT_URL: "https://www.peneder.com/de-at/impressum/",
        HOME_SITE_TOP_CONTENT: "NO",
      };
    }
    case WhitelabelName.be: {
      return {
        ...DEFAULT_WHITELABEL_CONFIG_VALUES,
        TITLE: "BE.Leo",
        DOMAIN: "leo-b2b.burgenlandenergie.at",
        MQTT_CERT_FILE_POSTFIX: "_be",
        LOGO_URL_LIGHT: "/images/be_logo_white.svg",
        LOGO_URL_DARK: "/images/be_logo_white.svg",
        FAVICON_URL: "/images/be_favicon.ico",
        LOGIN_LOGO: "/images/login/logo-be.svg",
        LOGIN_LOGO_DARK: "/images/be_logo_white.svg",
        LOGIN_BACKGROUND: "/images/login/background-be.jpg",
        REALM: "be",
        LIGHT_MAPBOX_STYLE_ID: "m-schwarzmann/clb15kwrn001m14qu6aypk7y7",
        DARK_MAPBOX_STYLE_ID: "m-schwarzmann/clb15ismb009j14qnytrh5gt1",
        THEMES: {
          light: {
            colors: {
              primary: "#ffffff",
              surface: "#ffffff",
              sideBarColor: "#000000",
              secondary: "#ffffff",
              accent: "#FDCC00",
              accentLight: "#fff0b3",
              lynusText: "#000000",
              lynusTextInvert: "#ffffff",
              lynusTextSidebar: "#ffffff",
              projectBackground: "#ffffff",
              deviceBackground: "#ffffff",
              secondaryDeviceBackground: "#808080",
              dndItemBackground: "#ffffff",
              inactiveItem: "#ffffff",
              activeItem: "#ffe066",
              primaryBorder: "#808080",
              error: "#E83B3A",
              overlay: "#fff0b3",
              lynusIcon: "#000000",
              green: "#30BF54",
              borderColoring: "#FDCC00",
            },
          },
          dark: {
            colors: {
              primary: "#000000",
              surface: "#000000",
              sideBarColor: "#000000",
              secondary: "#000000",
              accent: "#FDCC00",
              accentLight: "#fff0b3",
              lynusText: "#FFFFFF",
              lynusTextInvert: "#000000",
              lynusTextSidebar: "#FFFFFF",
              projectBackground: "#000000",
              deviceBackground: "#000000",
              secondaryDeviceBackground: "#808080",
              dndItemBackground: "#000000",
              inactiveItem: "#000000",
              activeItem: "#ffe066",
              primaryBorder: "#808080",
              error: "#E83B3A",
              overlay: "#fff0b3",
              lynusIcon: "#FDCC00",
              green: "#30BF54",
              borderColoring: "#FDCC00",
            },
          },
        },
        SETTINGS_MAIL_SUPPORT: "support@leo-b2b.burgenlandenergie.at",
        SETTINGS_TERMS_URL: "https://www.burgenlandenergie.at/de/allgemein/downloads/",
        SETTINGS_IMPRINT_URL: "https://www.burgenlandenergie.at/de/rechtliches/impressum/",
      };
    }
    case WhitelabelName.powerlink: {
      return {
        ...DEFAULT_WHITELABEL_CONFIG_VALUES,
        TITLE: "POWER-LINK",
        DOMAIN: "efficientio.com",
        MQTT_CERT_FILE_POSTFIX: "_efficientio",
        LOGO_URL_LIGHT: "/images/pl_logo_green.svg",
        LOGO_URL_DARK: "/images/pl_logo_green.svg",
        FAVICON_URL: "/images/pl_favicon.ico",
        LOGIN_LOGO: "/images/login/logo-powerlink.svg",
        LOGIN_LOGO_DARK: "/images/login/logo-powerlink.svg",
        LOGIN_BACKGROUND: "/images/login/background-powerlink.jpg",
        REALM: "powerlink",
        LIGHT_MAPBOX_STYLE_ID: "m-schwarzmann/clgz91g3q00g401r0701g2wsq",
        DARK_MAPBOX_STYLE_ID: "m-schwarzmann/clgz91kvc00ht01p6fl0sgm3x",
        THEMES: {
          light: {
            colors: {
              primary: "#ffffff",
              surface: "#ffffff",
              sideBarColor: "#000000",
              secondary: "#ffffff",
              accent: "#74bb20",
              accentLight: "#ffffff",
              lynusText: "#000000",
              lynusTextInvert: "#ffffff",
              lynusTextSidebar: "#ffffff",
              projectBackground: "#ffffff",
              deviceBackground: "#ffffff",
              secondaryDeviceBackground: "#595959",
              dndItemBackground: "#ffffff",
              inactiveItem: "#ffffff",
              activeItem: "#a0e151",
              primaryBorder: "#595959",
              error: "#E83B3A",
              overlay: "#c4ed92",
              lynusIcon: "#000000",
              green: "#30BF54",
              borderColoring: "#74bb20",
            },
          },
          dark: {
            colors: {
              primary: "#000000",
              surface: "#000000",
              sideBarColor: "#000000",
              secondary: "#000000",
              accent: "#74bb20",
              accentLight: "#ffffff",
              lynusText: "#FFFFFF",
              lynusTextInvert: "#000000",
              lynusTextSidebar: "#FFFFFF",
              projectBackground: "#000000",
              deviceBackground: "#000000",
              secondaryDeviceBackground: "#595959",
              dndItemBackground: "#000000",
              inactiveItem: "#000000",
              activeItem: "#a0e151",
              primaryBorder: "#595959",
              error: "#E83B3A",
              overlay: "#c4ed92",
              lynusIcon: "#74bb20",
              green: "#30BF54",
              borderColoring: "#74bb20",
            },
          },
        },
        SETTINGS_MAIL_SUPPORT: "support@efficientio.com",
        SETTINGS_TERMS_URL: "https://www.efficientio.com/agb/",
        SETTINGS_IMPRINT_URL: "https://www.efficientio.com/impressum/",
        ENABLE_GPS_ROUTER: true,
        SHOW_HARDWARE_ID: true,
        DEVICES: [...DEFAULT_WHITELABEL_CONFIG_VALUES.DEVICES, "SSP"],
      };
    }
    case WhitelabelName.smartsitepower: {
      return {
        ...DEFAULT_WHITELABEL_CONFIG_VALUES,
        TITLE: "SmartSite POWER",
        DOMAIN: "efficientio.com",
        MQTT_CERT_FILE_POSTFIX: "_efficientio",
        LOGO_URL_LIGHT: "/images/ssp_logo_white.svg",
        LOGO_URL_DARK: "/images/ssp_logo_white.svg",
        FAVICON_URL: "/images/ssp_favicon.ico",
        LOGIN_LOGO: "/images/login/ssp_logo_blue.svg",
        LOGIN_LOGO_DARK: "/images/login/ssp_logo_white.svg",
        LOGIN_BACKGROUND: "/images/login/background-ssp.jpg",
        REALM: "smartsitepower",
        LIGHT_MAPBOX_STYLE_ID: "m-schwarzmann/clktbosb700s901pb81ix9ljc",
        DARK_MAPBOX_STYLE_ID: "m-schwarzmann/clktbrpve00j801peei42bv0z",
        THEMES: {
          light: {
            colors: {
              primary: "#ffffff",
              surface: "#ffffff",
              sideBarColor: "#1B223C",
              secondary: "#ffffff",
              accent: "#03e0b5",
              accentLight: "#1B223C",
              lynusText: "#1B223C",
              lynusTextInvert: "#ffffff",
              lynusTextSidebar: "#ffffff",
              projectBackground: "#ffffff",
              deviceBackground: "#ffffff",
              secondaryDeviceBackground: "#c8cbd0",
              dndItemBackground: "#ffffff",
              inactiveItem: "#ffffff",
              activeItem: "#4ffcda",
              primaryBorder: "#c8cbd0",
              error: "#E83B3A",
              overlay: "#b4feef",
              lynusIcon: "#1B223C",
              green: "#30BF54",
              borderColoring: "#03e0b5",
            },
          },
          dark: {
            colors: {
              primary: "#1B223C",
              surface: "#1B223C",
              sideBarColor: "#1B223C",
              secondary: "#1B223C",
              accent: "#03e0b5",
              accentLight: "#1B223C",
              lynusText: "#FFFFFF",
              lynusTextInvert: "#1B223C",
              lynusTextSidebar: "#FFFFFF",
              projectBackground: "#1B223C",
              deviceBackground: "#1B223C",
              secondaryDeviceBackground: "#c8cbd0",
              dndItemBackground: "#1B223C",
              inactiveItem: "#1B223C",
              activeItem: "#4ffcda",
              primaryBorder: "#c8cbd0",
              error: "#E83B3A",
              overlay: "#b4feef",
              lynusIcon: "#03e0b5",
              green: "#30BF54",
              borderColoring: "#03e0b5",
            },
          },
        },
        SETTINGS_MAIL_SUPPORT: "support@smartsitepower.com",
        SETTINGS_TERMS_URL: "https://smartsitepower.com/agb/",
        SETTINGS_IMPRINT_URL: "https://smartsitepower.com/impressum/",
        ENABLE_GPS_ROUTER: true,
        SHOW_HARDWARE_ID: true,
        DEVICES: [...DEFAULT_WHITELABEL_CONFIG_VALUES.DEVICES, "SSP"],
      };
    }
    case WhitelabelName.bms: {
      return {
        ...DEFAULT_WHITELABEL_CONFIG_VALUES,
        TITLE: "BMS - Best Modification Systems",
        DOMAIN: "ems.bmsystems.at",
        MQTT_CERT_FILE_POSTFIX: "_bms",
        LOGO_URL_LIGHT: "/images/bms_logo_white.svg",
        LOGO_URL_DARK: "/images/bms_logo_white.svg",
        FAVICON_URL: "/images/bms_favicon.ico",
        LOGIN_LOGO: "/images/login/logo-bms.svg",
        LOGIN_LOGO_DARK: "/images/bms_logo_white.svg",
        LOGIN_BACKGROUND: "/images/login/background-bms.jpg",
        REALM: "bms",
        LIGHT_MAPBOX_STYLE_ID: "m-schwarzmann/clc5xq8v9000a15qo5srwj5tk",
        DARK_MAPBOX_STYLE_ID: "m-schwarzmann/clc5xnvux001v14s0xnf2yanw",
        THEMES: {
          light: {
            colors: {
              primary: "#ffffff",
              surface: "#ffffff",
              sideBarColor: "#363636",
              secondary: "#ffffff",
              accent: "#FFBC00",
              accentLight: "#363636",
              lynusText: "#363636",
              lynusTextInvert: "#ffffff",
              lynusTextSidebar: "#ffffff",
              projectBackground: "#ffffff",
              deviceBackground: "#ffffff",
              secondaryDeviceBackground: "#D6D6D6",
              dndItemBackground: "#ffffff",
              inactiveItem: "#ffffff",
              activeItem: "#fdda4e",
              primaryBorder: "#999999",
              error: "#E83B3A",
              overlay: "#feea9a",
              lynusIcon: "#363636",
              green: "#30BF54",
              borderColoring: "#FFBC00",
            },
          },
          dark: {
            colors: {
              primary: "#363636",
              surface: "#363636",
              sideBarColor: "#363636",
              secondary: "#363636",
              accent: "#FFBC00",
              accentLight: "#363636",
              lynusText: "#FFFFFF",
              lynusTextInvert: "#363636",
              lynusTextSidebar: "#FFFFFF",
              projectBackground: "#363636",
              deviceBackground: "#363636",
              secondaryDeviceBackground: "#999999",
              dndItemBackground: "#363636",
              inactiveItem: "#363636",
              activeItem: "#fdda4e",
              primaryBorder: "#999999",
              error: "#E83B3A",
              overlay: "#feea9a",
              lynusIcon: "#FFBC00",
              green: "#30BF54",
              borderColoring: "#FFBC00",
            },
          },
        },
        SETTINGS_MAIL_SUPPORT: "support@bmsystems.at",
        SETTINGS_TERMS_URL: "https://www.bmsystems.at/agb/",
        SETTINGS_IMPRINT_URL: "https://www.bmsystems.at/impressum/",
        WORKBENCH_CATEGORIES: [...DEFAULT_WHITELABEL_CONFIG_VALUES.WORKBENCH_CATEGORIES],
        // SIDEBAR_BADGE: "/assets/bmsystems/tuv_logo_original-1.webp",
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
        LIGHT_MAPBOX_STYLE_ID: "m-schwarzmann/clragi1cr006c01qtdsfv0fr3",
        DARK_MAPBOX_STYLE_ID: "m-schwarzmann/clragi8zf005t01pe42zng7po",
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
