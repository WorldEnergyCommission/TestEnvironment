import { CapacitorConfig } from "@capacitor/cli";

interface FlavorConfiguration {
  flavor: string;
  host: string;
}

function getFlavorConfiguration(): FlavorConfiguration {
  const flavor = process.env.APP_FLAVOR ?? "dev";
  let host: string | undefined = undefined;
  switch (flavor) {
    case "efficientio":
      host = "console.efficientio.com";
      break;
    case "dev":
      host = "console.efficientio.io";
      break;
    case "tsg":
      host = "console.tsg-portal.de";
      break;
    case "peneder":
      host = "connect.peneder.com";
      break;
    case "bmsystems":
      host = "bmsystems.efficientio.com";
      break;
    case "be":
      host = "be-leo-business.burgenlandenergie.at";
      break;
    case "powerlink":
      host = "console.power-link.at";
      break;
    case "smartsitepower":
      host = "console.smartsitepower.com";
      break;
    case "effectas":
      host = "console.effectas.com";
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
