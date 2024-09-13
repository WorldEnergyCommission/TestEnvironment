import mlModelTypes from "@/store/modules/mpc/mlModelTypes";

export const mpc = {
  namespaced: true,
  state: {
    mlModelTypes: mlModelTypes,
  },
  getters: {
    mlModelTypes() {
      return mlModelTypes;
    },
    mlModelTypeSchemaByKey() {
      return (type: string) => (mlModelTypes as any)[type];
    },
    mlModelIsSettings() {
      return [];
    },
    mpcControllers() {
      return [];
    },
    mlModelDevices() {
      return [
        {
          name: "PVMonitoringService",
          type: "PVMonitoringService",
          id: "PVMonitoringService",
          collection_id: "roomId",
          data: {
            type: "PVMonitoringService",
            mappings: {},
            meta: {
              controllerMappings: {},
            },
          },
        },
      ];
    },
  },
  mutations: {},
  actions: {
    updateSetpointSystemInstanceTemperatureSettings() {
      console.log("updateSetpointSystemInstanceTemperatureSettings");
      return Promise.resolve();
    },
    fetchMPCWeatherStatus() {
      console.log("fetchMPCWeatherStatus");
      return Promise.resolve();
    },
    activateWeatherService() {
      console.log("activateWeatherService");
      return Promise.resolve();
    },
    fetchMPCData() {
      console.log("fetchMPCData");
      return Promise.resolve({
        data: {
          meta: {
            charts: {
              predictedEnergy: {
                pv: [
                  [1583100000, 23],
                  [1583103600, 26],
                  [1583107200, 22],
                  [1583110800, 28],
                  [1583114400, 28],
                  [1583118000, 29],
                  [1583121600, 29],
                ],
              },
              predictedPower: {
                pv: [
                  [1583100000, 24],
                  [1583103600, 28],
                  [1583107200, 20],
                  [1583110800, 27],
                  [1583114400, 23],
                  [1583118000, 26],
                  [1583121600, 27],
                ],
              },
            },
          },
        },
      });
    },
    fetchMPCListByProject() {
      console.log("fetchMPCListByProject");
      return Promise.resolve();
    },
    fetchAutarkiegrad() {
      console.log("fetchAutarkiegrad");
      return Promise.resolve();
    },
    addMPCToFavorites(mpcId: string) {
      console.log("addMPCToFavorites", mpcId);
      return Promise.resolve();
    },
    removeMPCFromFavorites(mpcId: string) {
      console.log("removeMPCFromFavorites", mpcId);
      return Promise.resolve();
    },
    deleteMPC(mpcId: string) {
      console.log("deleteMPC", mpcId);
      return Promise.resolve();
    },
    updateMPC(mpcId: string) {
      console.log("updateMPC", mpcId);
      return Promise.resolve();
    },
  },
};
