import { vueRouter } from "storybook-vue3-router";

import MainViewComponent from "./MainView.vue";
import forecastMockData from "@/ui/components/devices/previews/mpc/SetpointOptimizer/forecastMockData";

export default {
  title: "Devices/MPC/SetpointOptimizer/MainView",
  component: MainViewComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const MainView = {
  ...Template,
  args: {
    systemsData: {
      heating_air_systems: {
        components: {
          heating_air_systems1: {
            room_temperatures: [
              {
                title: "room",
                variable: "variable",
              },
            ],
          },
        },
        count: 1,
      },
      heating_water_systems: {
        components: {
          heating_water_systems1: {
            room_temperatures: [
              {
                title: "room",
                variable: "variable",
              },
            ],
          },
        },
        count: 1,
      },
      cooling_air_systems: {
        components: {
          cooling_air_systems1: {
            room_temperatures: [
              {
                title: "room",
                variable: "variable",
              },
            ],
          },
          cooling_air_systems2: {
            room_temperatures: [
              {
                title: "room",
                variable: "variable",
              },
            ],
          },
          cooling_air_systems3: {
            room_temperatures: [
              {
                title: "room",
                variable: "variable",
              },
            ],
          },
          cooling_air_systems4: {
            room_temperatures: [
              {
                title: "room",
                variable: "variable",
              },
            ],
          },
          cooling_air_systems5: {
            room_temperatures: [
              {
                title: "room",
                variable: "variable",
              },
            ],
          },
          cooling_air_systems6: {
            room_temperatures: [
              {
                title: "room",
                variable: "variable",
              },
            ],
          },
          cooling_air_systems7: {
            room_temperatures: [
              {
                title: "room",
                variable: "variable",
              },
            ],
          },
          cooling_air_systems8: {
            room_temperatures: [
              {
                title: "room",
                variable: "variable",
              },
            ],
          },
          cooling_air_systems9: {
            room_temperatures: [
              {
                title: "room",
                variable: "variable",
              },
            ],
          },
          cooling_air_systems10: {
            room_temperatures: [
              {
                title: "room",
                variable: "variable",
              },
            ],
          },
        },
        count: 10,
      },
      cooling_water_systems: {
        components: {
          cooling_water_systems1: {
            room_temperatures: [
              {
                title: "room",
                variable: "variable",
              },
            ],
          },
        },
        count: 1,
      },
      hybrid_water_systems: {
        components: {
          hybrid_water_systems1: {
            room_temperatures: [
              {
                title: "room",
                variable: "variable",
              },
            ],
            max_flow_temperature: {
              heating: 30,
              cooling: 30,
            },
            min_flow_temperature: {
              heating: 18,
              cooling: 18,
            },
            set_point_temperature: {
              heating: 23,
              cooling: 23,
            },
          },
        },
        count: 1,
      },
      hybrid_air_systems: {
        components: {
          hybrid_air_systems1: {
            room_temperatures: [
              {
                title: "room",
                variable: "variable",
              },
            ],
            max_flow_temperature: {
              heating: 30,
              cooling: 30,
            },
            min_flow_temperature: {
              heating: 18,
              cooling: 18,
            },
            set_point_temperature: {
              heating: 23,
              cooling: 23,
            },
          },
        },
        count: 1,
      },
    },
    forecastData: forecastMockData,
    mpcId: "mpc",
  },
};
