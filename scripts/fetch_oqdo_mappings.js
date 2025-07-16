const fs = require("fs").promises;

const OQDO_BASE_URL = "https://oqdo-apim-prod.azure-api.net";
const OQDO_TOKEN = process.env.OQDO_TOKEN || "";

const DEVICE_BLACKLIST = [
  "AutomationApps.Collections.SpaceCollections.Campus",
  "AutomationApps.ReportsAndStatistics.Alarm.TopAlarms",
  "AutomationApps.Devices.ExistingBacnetDevice",
  "AutomationApps.Devices.BacnetDevice",
  "AutomationApps.Devices.EdgeDevice",
  "AutomationApps.Plants.Buildings.P_Building",
  "AutomationApps.Plants.Buildings.P_Floor",
  "AutomationApps.Plants.AirHandlingUnits.P_AirHandlingUnit",
  "AutomationApps.Plants.Heatings.P_HeatingPuffer",
  "AutomationApps.Plants.Heatings.P_HeatingOutlet",
  "AutomationApps.Plants.Commons.P_Common",
  "AutomationApps.Plants.Heatings.P_HeatingBoiler",
  "AutomationApps.Plants.Heatings.P_DistrictHeating",
];

const VALUE_WHITELIST = [
  "value",
  "isOn",
  "flow1",
  "flow2",
  "flowMax",
  "flowMin",
  "flowBase",
  "outT1",
  "outT2",
];

const getMappings = async (resourceId, groupId = null) => {
  const mappings = {};

  try {
    const devices = await analyize(resourceId, groupId);
    const converted = convert(resourceId, devices);

    console.log(
      converted.length,
      "devices found for group:",
      resourceId,
      groupId
    );

    for (const device of converted) {
      mappings[device.key] = device.name;
    }
  } catch (e) {
    console.error("Error fetching mappings:", e, resourceId, groupId);
  }

  return mappings;
};

const analyize = async (parent, child = null) => {
  const devices = [];

  try {
    const url = [parent, child || "", !!child ? "children" : ""]
      .filter(Boolean)
      .join("/");

    const data = await makeRequest(url);

    if (data && Array.isArray(data)) {
      for (const device of data) {
        if (!DEVICE_BLACKLIST.includes(device.schema)) {
          console.log(`Found device: ${device.name} - ${device.id}`);
          devices.push(device);
        }

        const children = await analyize(parent, device.id);
        devices.push(...children);
      }
    }
  } catch (e) {}

  return devices;
};

const convert = (groupId, devices) => {
  const results = [];

  for (const device of devices) {
    const keys = Object.keys(device).filter((key) =>
      VALUE_WHITELIST.includes(key)
    );

    const newDevices = keys.map((k) => {
      const keysParts = [groupId, device.id, k];
      const key = keysParts.join(".");

      const deviceName =
        device.externalIds?.PlantIdentification ||
        device.name + "." + device.description ||
        "";

      const fixedName = deviceName
        .replace(/'/g, ".")
        .replace(/\s+/g, "")
        .trim();

      const name = `${fixedName}.${k}${k === "value" ? "" : ".value"}`;

      return {
        key,
        name,
      };
    });
    results.push(...newDevices);
  }

  return results;
};

const makeRequest = async (url) => {
  try {
    const fullUrl = `${OQDO_BASE_URL}/objects/v2/objects/${url}`;
    const headers = {
      Authorization: `Bearer ${OQDO_TOKEN}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(fullUrl, { method: "GET", headers });

    const { data } = await response.json();
    return data;
  } catch (e) {
    console.error("Request failed:", url, e);
  }
};

(async () => {
  const resourceId = process.argv[2];
  const groupId = process.argv[3];

  if (!resourceId) {
    console.log(
      "Usage: node fetch_oqdo_mappings.js <resourceId> <groupId (optional)>"
    );
    return;
  }

  console.log("Fetching oqdo mappings for:", resourceId, groupId);

  const mappings = await getMappings(resourceId, groupId);

  await fs.writeFile(
    "import_mappings.json",
    JSON.stringify({ oqdo: mappings }, null, 2)
  );
})();
