import { vueRouter } from "storybook-vue3-router";

import ChartsRoomTemperaturesComponent from "./ChartsRoomTemperatures.vue";

export default {
  title: "Devices/MPC/SetpointOptimizer/charts/ChartsRoomTemperatures",
  component: ChartsRoomTemperaturesComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ChartsRoomTemperatures = {
  ...Template,
  args: {
    systemsMappings: {
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
        },
        count: 1,
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
  },
};
