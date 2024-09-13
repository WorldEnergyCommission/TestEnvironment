import GeneralComponent from "./General.vue";

export default {
  title: "Views/Profile/General",
  component: GeneralComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.efficientio.io/v1/users/userId",
        method: "GET",
        status: 200,
        response: {
          address: {
            street: "Street",
            city: "City",
            country: "Country",
            zip_code: "Zip code",
          },
          mobile: "Mobile",
        },
      },
    ],
  },
};

export const General = {
  args: {},
};
