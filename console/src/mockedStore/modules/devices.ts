import devicesTypes from "@/store/modules/devices/settings/devicesTypes";

export const devices = {
  namespaced: true,
  state: {
    devicesFilter: "",
  },
  getters: {
    devicesTypes() {
      return devicesTypes;
    },
    devicesByRoom() {
      return () => [];
    },
    deviceTypeSchemaByKey() {
      return (type: string) => (devicesTypes as any)[type];
    },
    devicesIsSettings() {
      return Object.entries(devicesTypes).map((device: any) => [
        device[0],
        device[1].isSettingsView,
      ]);
    },
    favoritesDevices() {
      return [
        {
          id: "device2",
          name: "Device 2",
          data: {
            type: "StreamAnomalyDetection",
            chartOptions: [
              {
                calculation: {
                  expression: "",
                },
                scaling: {
                  max: 100,
                  min: 0,
                },
                name: "Temperature",
                type: "spline",
              },
              {
                name: "AnomalyScore",
                type: "line",
                calculation: {
                  expression: "",
                },
                scaling: {
                  max: 100,
                  min: 0,
                },
              },
            ],
            meta: {
              controllerMappings: {
                anomalyScore: [],
              },
            },
          },
          favorite: true,
          collection_id: "collection1",
          created_at: new Date(),
        },
      ];
    },
    devices() {
      return [
        {
          id: "device1",
          name: "LightSwitch",
          collection_id: "roomId",
          data: {
            type: "LightSwitch",
          },
        },
        {
          id: "device2",
          name: "StreamAnomalyDetection",
          data: {
            type: "StreamAnomalyDetection",
            chartOptions: [
              {
                calculation: {
                  expression: "",
                },
                scaling: {
                  max: 100,
                  min: 0,
                },
                name: "Temperature",
                type: "spline",
              },
              {
                name: "AnomalyScore",
                type: "line",
                calculation: {
                  expression: "",
                },
                scaling: {
                  max: 100,
                  min: 0,
                },
              },
            ],
            meta: {
              controllerMappings: {
                anomalyScore: [],
              },
            },
          },
          favorite: true,
          collection_id: "collection1",
          created_at: new Date(),
        },
      ];
    },
    devicesTypesWithLocaleNamesList() {
      return [];
    },
  },
  mutations: {
    setDevicesFilter(name: string) {
      console.log("setDevicesFilter", name);
    },
  },
  actions: {
    deleteDevice() {
      console.log("deleteDevice");
      return Promise.resolve();
    },
    updateDevice() {
      console.log("updateDevice");
      return Promise.resolve();
    },
    removeDeviceFromFavorites() {
      console.log("removeDeviceFromFavorites");
      return Promise.resolve();
    },
    addDeviceToFavorites() {
      console.log("addDeviceToFavorites");
      return Promise.resolve();
    },
    fetchDevices() {
      console.log("fetchDevices");
      return Promise.resolve();
    },
  },
};
