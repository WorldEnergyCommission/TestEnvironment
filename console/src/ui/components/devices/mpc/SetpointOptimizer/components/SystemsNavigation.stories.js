import SystemsNavigationComponent from "./SystemsNavigation.vue";

export default {
  title: "Devices/MPC/SetpointOptimizer/components/SystemsNavigation",
  component: SystemsNavigationComponent,
};

export const SystemsNavigation = {
  args: {
    items: [["heating_air_systems", ["heating_air_systems1", "heating_air_systems2"]]],
  },
};
