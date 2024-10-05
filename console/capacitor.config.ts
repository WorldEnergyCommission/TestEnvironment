import { CapacitorConfig } from "@capacitor/cli";

interface FlavorConfiguration {
  flavor: string;
  host: string;
}

function getFlavorConfiguration(): FlavorConfiguration {
  const flavor = process.env.APP_FLAVOR ?? "eneries";
  let host: string | undefined = undefined;
  switch (flavor) {
    case "eneries":
      host = "console.eneries.com";
      break;
  }
  if (host === undefined) {
    console.error("invalid flavor configuration ...");
    process.exit(1);
  }
  return { flavor: flavor, host: host };
}

const config: CapacitorConfig = {
  webDir: "dist",
  server: {
    androidScheme: "https",
    url: process.env.LOCAL_NETWORK_IP ? `http://${process.env.LOCAL_NETWORK_IP}:8080` : undefined,
    cleartext: !!process.env.LOCAL_NETWORK_IP,
  },
  includePlugins: ["@capacitor/app", "@capacitor/splash-screen", "@capgo/capacitor-updater"],
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,
      updateUrl: `https://${getFlavorConfiguration().host}/console-capacitor-updater/latest`,
      statsUrl: "",
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      launchFadeOutDuration: 0,
      androidScaleType: "CENTER_CROP",
    },
  },
  zoomEnabled: false,
  android: {
    flavor: getFlavorConfiguration().flavor,
  },
  ios: {
    scheme: getFlavorConfiguration().flavor,
  },
  cordova: {
    accessOrigins: [],
  },
};

export default config;
