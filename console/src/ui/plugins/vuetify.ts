import { useI18n } from "vue-i18n";
import { createVuetify } from "vuetify";
import { md3 } from "vuetify/blueprints";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, fa } from "vuetify/iconsets/fa";
import { mdi } from "vuetify/iconsets/mdi";
import * as labsComponents from "vuetify/labs/components";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";
import "vuetify/styles";

import { i18n } from "@/ui/plugins/i18n";
import { envDefaultsToDarkmode, envThemes } from "@/utils/env";

export const vuetify = createVuetify({
  blueprint: md3,
  components: { ...components, ...labsComponents },
  directives: directives,
  defaults: {
    global: {
      density: "compact",
    },
    VBtn: {
      variant: "text",
      density: "comfortable",
    },
  },
  icons: {
    defaultSet: "fa",
    aliases,
    sets: {
      fa,
      mdi,
    },
  },
  theme: {
    themes: envThemes,
    variations: {
      colors: [
        "primary",
        "secondary",
        "deviceBackground",
        "accent",
        "accentLight",
        "secondaryDeviceBackground",
        "sideBarColor",
      ],
      lighten: 3,
      darken: 3,
    },
    defaultTheme: envDefaultsToDarkmode ? "dark" : "light",
  },
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
});
