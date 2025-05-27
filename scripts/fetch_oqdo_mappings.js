const fs = require("fs").promises;

const OQDO_BASE_URL = "https://oqdo-apim-prod.azure-api.net";
const OQDO_TOKEN = process.env.OQDO_TOKEN || "";

const getMappings = async (groupId) => {
  const mappings = {};

  try {
    const group = await getGroup(groupId);

    console.log("Analyizing WiFI group:", group.name);

    const buildings = await getResource(
      group.resourceGroupId,
      group.id,
      "AutomationApps.Plants.Buildings.P_Building"
    );

    console.log(
      "Found buildings:",
      buildings.length,
      buildings.map((b) => b.name)
    );

    for (const building of buildings) {
      const sections = await getResource(
        group.resourceGroupId,
        building.id,
        "AutomationApps.Plants.Buildings.P_RoomAutomation"
      );

      for (const section of sections) {
        const stories = await getResource(
          group.resourceGroupId,
          section.id,
          "AutomationApps.Plants.Buildings.P_Floor"
        );

        for (const story of stories) {
          const rooms = await getResource(group.resourceGroupId, story.id);

          for (const room of rooms) {
            const devices = await getResource(group.resourceGroupId, room.id);

            if (devices.length > 0) {
              devices.forEach((device) => {
                mappings[`${group.resourceGroupId}.${device.id}`] =
                  convertMappingKey(building, section, story, room, device);
              });
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Error fetching mappings:", e, groupId);
  }

  return mappings;
};

const convertMappingKey = (building, section, story, room, device) => {
  try {
    const buildingName = building.name
      .split(/\s+/)
      .map((w) => w[0])
      .join("");

    const roomName = room.name.replace(/\D/g, "");
    const deviceName = device.name.replace(/[^a-zA-Z0-9]/g, "");

    return `${buildingName}.${story.name}${roomName}.${deviceName}.value`;
  } catch (e) {
    console.error("Error converting mapping key:", e);
    return null;
  }
};

const getGroup = async (groupId) => {
  const data = await makeRequest(groupId);

  return data
    .filter(
      (d) => d.schema === "AutomationApps.Collections.SpaceCollections.Campus"
    )
    .pop();
};

const getResource = async (groupId, resourceId, schemaFilter) => {
  const data = await makeRequest(`${groupId}/${resourceId}/children`);

  return data
    .map((device) => {
      return {
        id: device.id,
        name: device.name,
        schema: device.schema,
        device,
      };
    })
    .filter((device) => {
      if (schemaFilter) return device.schema === schemaFilter;
      return true;
    });
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
  const project = "232ae843-68c3-42e3-ba79-a486a188724a"; // WIFI-Linz
  const mappings = await getMappings(project);

  await fs.writeFile("import_mappings.json", JSON.stringify(mappings, null, 2));
})();
