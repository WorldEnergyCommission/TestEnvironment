import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import type { BundleInfo } from "@capgo/capacitor-updater";
import { CapacitorUpdater } from "@capgo/capacitor-updater";

import { getLatestSha } from "@/utils/utilsFunctions";

export async function checkAndUpdateApp() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  await CapacitorUpdater.notifyAppReady();

  let data: BundleInfo | undefined = undefined;

  if (getLatestSha() === "SHA") {
    return;
  }

  App.addListener("appStateChange", async ({ isActive }) => {
    if (isActive) {
      const latest = await CapacitorUpdater.getLatest();
      if (latest.url && latest.version != getLatestSha()) {
        data = await CapacitorUpdater.download({
          url: latest.url,
          version: latest.version,
        });
      }
    }
    if (!isActive && data) {
      await SplashScreen.show();
      try {
        await CapacitorUpdater.set({ id: data.id });
      } catch (err) {
        console.log(err);
        await SplashScreen.hide();
      }
    }
  });
}

export async function forceUpdate() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  let data: BundleInfo | undefined = undefined;

  await SplashScreen.show();
  if (getLatestSha() === "SHA") {
    return;
  }

  const latest = await CapacitorUpdater.getLatest();

  if (latest.url && latest.version != getLatestSha()) {
    data = await CapacitorUpdater.download({
      url: latest.url,
      version: latest.version,
    });
  }

  if (data) {
    try {
      await CapacitorUpdater.set({ id: data.id });
    } catch (err) {
      console.log(err);
    }
  }
  await SplashScreen.show();
}
