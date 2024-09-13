import DownloadsComponent from "./Downloads.vue";

export default {
  title: "Components/Downloads",
  component: DownloadsComponent,
};

export const Downloads = {
  args: {
    fullWidth: true,
    chips: [
      {
        sign: "Sign 1",
        value: 1,
        title: "Title 1",
      },
      {
        sign: "Sign 2",
        value: 2,
        link: "/",
        title: "Title 2",
      },
      {
        sign: "Sign 3",
        value: 3,
        file: "",
        title: "Title 3",
      },
    ],
  },
};
