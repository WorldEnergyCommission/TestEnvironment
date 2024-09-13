import AverageRoomTempsComponent from "./AverageRoomTemps.vue";

export default {
  title: "Devices/MPC/SetpointOptimizer/system/components/AverageRoomTemps",
  component: AverageRoomTempsComponent,
};

export const AverageRoomTemps = {
  args: {
    controls: {
      room_temperatures: [
        {
          title: "room",
          variable: "actualValue",
        },
      ],
    },
    roomTemperatures: [0],
  },
};
