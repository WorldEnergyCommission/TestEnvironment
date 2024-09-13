import AuthenticatorComponent from "./Authenticator.vue";

export default {
  title: "Views/Profile/Authenticator",
  component: AuthenticatorComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.eneries.io/v1/users/me/otp/qr",
        method: "GET",
        status: 200,
        response: {
          QR: "",
          Secret: "secret",
        },
      },
      {
        url: "https://api.eneries.io/v1/users/me/otp",
        method: "GET",
        status: 200,
        response: [
          {
            id: "id",
            created_date: 1711355289019,
            device_name: "Device name",
          },
        ],
      },
    ],
  },
};

export const Authenticator = {
  args: {},
};
