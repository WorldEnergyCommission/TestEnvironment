import CoreToolbar from "./Toolbar.vue";
import CoreToolbarTitle from "./ToolbarTitle.vue";

export default {
  title: "Core/Toolbar",
  component: CoreToolbar,
};

const Template = {
  render: (args) => ({
    components: {
      CoreToolbar,
      CoreToolbarTitle,
    },
    template: `
    <CoreToolbar>
      <CoreToolbarTitle>
        Toolbar title
      </CoreToolbarTitle>
    </CoreToolbar>
    `,
  }),
};

export const Toolbar = {
  ...Template,
  args: {},
};
