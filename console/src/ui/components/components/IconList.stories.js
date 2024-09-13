import IconListComponent from "./IconList.vue";

export default {
  title: "Components/IconList",
  component: IconListComponent,
};

export const IconList = {
  args: {
    icons: [
      {
        id: "4801555",
      },
      {
        id: "4801556",
      },
      {
        id: "4801557",
      },
      {
        id: "4801558",
      },
    ],
    search: (q) => {
      return new Promise((res) => {
        res();
      });
    },
  },
};
