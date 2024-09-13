import OfflineTimerComponent from "./OfflineTimer.vue";

const Template = {
  render: (args) => ({
    components: { OfflineTimerComponent },
    mounted() {
      this.$nextTick(() => {
        this.$refs.MY_REF.delay = 0;
        this.$refs.MY_REF.onRouteChange("Name");
      });
    },
    template: `
      <OfflineTimerComponent ref="MY_REF" />
    `,
  }),
};

export default {
  title: "Components/OfflineTimer",
  component: OfflineTimerComponent,
};

export const OfflineTimer = {
  ...Template,
  args: {},
};
