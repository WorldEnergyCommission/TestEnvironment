import GeneralComponent from "./General.vue";

export default {
  title: "Lists/SettingsList/General",
  component: GeneralComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.eneries.com/v1/places?q=Location",
        method: "GET",
        status: 200,
        response: ["Location 1", "Location 2"],
      },
    ],
  },
};

export const General = {
  args: {},
};
