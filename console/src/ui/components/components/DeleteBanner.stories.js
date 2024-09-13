import DeleteButtonComponent from "./buttons/DeleteButton.vue";
import DeleteBannerComponent from "./DeleteBanner.vue";

export default {
  title: "Components/DeleteBanner",
  component: DeleteBannerComponent,
};

const Template = {
  render: (args) => ({
    components: {
      DeleteBannerComponent,
      DeleteButtonComponent,
    },
    template: `
    <DeleteBannerComponent>
      <DeleteButtonComponent></DeleteButtonComponent>
    </DeleteBannerComponent>
    `,
  }),
};

export const DeleteBanner = {
  ...Template,
  args: {
    text: "Delete banner text",
  },
};
