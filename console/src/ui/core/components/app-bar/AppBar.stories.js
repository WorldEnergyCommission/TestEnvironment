import CoreAppBar from "./AppBar.vue";
import CoreAppBarNavIcon from "./AppBarNavIcon.vue";

export default {
  title: "Core/AppBar",
  component: CoreAppBar,
};

const Template = {
  render: (args) => ({
    components: {
      CoreAppBar,
      CoreAppBarNavIcon,
    },
    template: `
    <CoreAppBar>
      <CoreAppBarNavIcon />
    </CoreAppBar>
    `,
  }),
};

export const AppBar = {
  ...Template,
  args: {},
};
