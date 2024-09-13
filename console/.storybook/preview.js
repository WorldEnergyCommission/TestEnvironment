/** @type { import('@storybook/vue3').Preview } */
import { setup } from "@storybook/vue3";
import { withVuetifyTheme } from "./withVuetifyTheme.decorator";
import { useArgs } from "@storybook/client-api";
import { vuetify } from "@/ui/plugins/vuetify";
import { i18n } from "@/ui/plugins/i18n";
import { mockedStore } from "@/mockedStore";
import LynusIcon from "@/ui/components/components/LynusIcon.vue";
import "@fortawesome/fontawesome-free/css/all.css";
import "@mdi/font/css/materialdesignicons.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import "leaflet/dist/leaflet.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css";
import "@fontsource/clear-sans";
import "@/ui/scss/main.scss";

const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

setup((app) => {
  app.use(vuetify);
  app.use(i18n);
  app.use(mockedStore);
  app.component("lynus-icon", LynusIcon);
});

export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Global theme for components",
    toolbar: {
      icon: "paintbrush",
      items: [
        { value: "light", title: "Light", left: "🌞" },
        { value: "dark", title: "Dark", left: "🌛" },
      ],
      dynamicTitle: true,
    },
  },
};

export default preview;

export const decorators = [
  withVuetifyTheme,
  (story, context) => {
    const [_, updateArgs] = useArgs();
    return story({ ...context, updateArgs });
  },
];
