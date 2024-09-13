import { Capacitor } from "@capacitor/core";

import {
  getWhitelabelConfigForWhitelabelName,
  getWhitelabelNameForWhitelabelApp,
  getWhitelabelNameForWhitelabelHost,
  WhitelabelApp,
  WhitelabelConfig,
  WhitelabelHost,
  WhitelabelName,
} from "../../config";
import { getAppId } from "@/utils/appBootstrapFunctions";

/**
 * returns the correct whitelabel config for the current environment
 */
function getWhitelabelConfig(): WhitelabelConfig {
  // this is the default whitelabel config - here you can set the config used for the dev server
  let whitelabelConfig = getWhitelabelConfigForWhitelabelName(WhitelabelName.eneries);
  // change config based on host or app
  if (Capacitor.isNativePlatform()) {
    // get the current app
    const app = getAppId() ?? "";
    // check if it was not correctly set
    if (app.length === 0) {
      console.error("ERROR: The app identifier was not correctly set");
    }
    // check if app satisfies spec
    if (Object.values<string>(WhitelabelApp).includes(app)) {
      // if yes update whitelabel config
      whitelabelConfig = getWhitelabelConfigForWhitelabelName(
        getWhitelabelNameForWhitelabelApp(app as WhitelabelApp),
      );
    }
  } else {
    if (import.meta.env.VITE_CUSTOM_WHITELABEL_NAME) {
      // get the current name
      const name = import.meta.env.VITE_CUSTOM_WHITELABEL_NAME;
      // check if name satisfies spec
      if (Object.values<string>(WhitelabelName).includes(name)) {
        // if yes update whitelabel config
        whitelabelConfig = getWhitelabelConfigForWhitelabelName(name as WhitelabelName);
      }
    } else {
      // get the current host
      const host = window.location.host;

      // on preview in host return dev
      if (host.includes("preview")) {
        whitelabelConfig = getWhitelabelConfigForWhitelabelName(WhitelabelName.dev);

        //  else check if host satisfies spec
      } else if (Object.values<string>(WhitelabelHost).includes(host)) {
        // if yes update whitelabel config
        whitelabelConfig = getWhitelabelConfigForWhitelabelName(
          getWhitelabelNameForWhitelabelHost(host as WhitelabelHost),
        );
      }
    }
  }
  // return the correct whitelabel config
  return whitelabelConfig;
}

// export environment variables from this file
export const envDomain = getWhitelabelConfig().DOMAIN;
export const envKeycloakURL = `https://accounts.${envDomain}/auth`;
export const envApi = import.meta.env.VITE_CUSTOM_API_URL ?? `https://api.${envDomain}/v1`;
export const envMpcApi = `https://mpc.${envDomain}`;
export const envMqtt = `mqtt.${envDomain}`;
export const envMqttCertFilePostfix = getWhitelabelConfig().MQTT_CERT_FILE_POSTFIX;
export const envTitle = getWhitelabelConfig().TITLE;
export const envLogoURLLight = getWhitelabelConfig().LOGO_URL_LIGHT;
export const envLogoURLDark = getWhitelabelConfig().LOGO_URL_DARK;
export const envFaviconURL = getWhitelabelConfig().FAVICON_URL;
export const envProjectOpenSubpage = getWhitelabelConfig().PROJECT_OPEN_SUBPAGE;
export const envRealm = getWhitelabelConfig().REALM;
export const envClientId = getWhitelabelConfig().CLIENT_ID;
export const envDefaultsToDarkmode = getWhitelabelConfig().DEFAULTS_TO_DARKMODE;
export const envLightMapboxStyleId = getWhitelabelConfig().LIGHT_MAPBOX_STYLE_ID;
export const envDarkMapboxStyleId = getWhitelabelConfig().DARK_MAPBOX_STYLE_ID;
export const envThemes = getWhitelabelConfig().THEMES;
export const envDevices = getWhitelabelConfig().DEVICES;
export const envAppShowProjectTypeSelection = getWhitelabelConfig().SHOW_PROJECT_TYPE_SELECTION;
export const envProjectMenuEntries = getWhitelabelConfig().PROJECT_MENU_ENTRIES;
export const envProjectSettingsEntries = getWhitelabelConfig().PROJECT_SETTINGS_ENTRIES;
export const envWorkbenchCategories = getWhitelabelConfig().WORKBENCH_CATEGORIES;
export const envDeviceLibraryCategories = getWhitelabelConfig().DEVICE_LIBRARY_CATEGORIES;
export const envAimlLibraryCategories = getWhitelabelConfig().AIML_LIBRARY_CATEGORIES;
export const envMainMenuEntries = getWhitelabelConfig().MAIN_MENU_ENTRIES;
export const envWorkbenchButtons = getWhitelabelConfig().WORKBENCH_BUTTONS;
export const envSettingsMailSupport = getWhitelabelConfig().SETTINGS_MAIL_SUPPORT;
export const envSettingsDownloadList = getWhitelabelConfig().SETTINGS_DOWNLOAD_LIST;
export const envSettingsShowWeatherService = getWhitelabelConfig().SETTINGS_SHOW_WEATHER_SERVICE;
export const envDocumentationTabs = getWhitelabelConfig().DOCUMENTATION_TABS;
export const envLoadMPC = getWhitelabelConfig().LOAD_MPC;
export const envShowProjectInfo = getWhitelabelConfig().SHOW_PROJECT_INFO;
export const envShowCreateDeviceButtonInArea =
  getWhitelabelConfig().SHOW_CREATE_DEVICE_BUTTON_IN_AREA;
export const envMPCDeviceList = getWhitelabelConfig().MPC_Devices_List;
export const envLimits = getWhitelabelConfig().LIMITS;
export const envHomeSiteTopContent = getWhitelabelConfig().HOME_SITE_TOP_CONTENT;
export const loginLogo = getWhitelabelConfig().LOGIN_LOGO;
export const loginLogoDark = getWhitelabelConfig().LOGIN_LOGO_DARK;
export const loginBackground = getWhitelabelConfig().LOGIN_BACKGROUND;
export const envEnableGPSRouter = getWhitelabelConfig().ENABLE_GPS_ROUTER;
export const emailAsUser = getWhitelabelConfig().EMAIL_AS_USER;
export const showHardwareId = getWhitelabelConfig().SHOW_HARDWARE_ID;
export const sideBarBadge = getWhitelabelConfig().SIDEBAR_BADGE;
