import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

/**
 * save the app identifier
 */
let app: string | undefined = undefined;

/**
 * set the app used for the whitelabel config retrieval
 */
export function setAppId(appId: string) {
  app = appId;
}

/**
 * get the app used for the whitelabel config retrieval
 */
export function getAppId(): string | undefined {
  return app;
}

/**
 * setup the application id in the preferences
 */
export async function setupAppId() {
  // set the application id used to retrieve the correct whitelabel config
  if (Capacitor.isNativePlatform()) {
    const appInfo = await App.getInfo();
    setAppId(appInfo.id);
  }
}
