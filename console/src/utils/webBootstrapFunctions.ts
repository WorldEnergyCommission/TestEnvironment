import Clipboard from "clipboard";
import HighchartsVue from "highcharts-vue";
import mitt from "mitt";
import { createApp } from "vue";
import VueApexCharts from "vue3-apexcharts";

import { router } from "@/router";
import { store } from "@/store";
import App from "@/ui/App.vue";
import LynusIcon from "@/ui/components/components/LynusIcon.vue";
import { i18n } from "@/ui/plugins/i18n";
import { vuetify } from "@/ui/plugins/vuetify";
import { envFaviconURL, envProjectOpenSubpage, envTitle } from "@/utils/env";
import { changeFavicon } from "@/utils/utilsFunctions";

export async function setupVue() {
  const app = createApp(App);

  app.use(store);
  app.use(router);
  app.use(vuetify);
  app.use(i18n);
  app.use(VueApexCharts);

  app.use(HighchartsVue as any);

  app.component("LynusIcon", LynusIcon);

  app.mixin({
    // make important env variables accessible throughout whole app
    data() {
      return {
        projectOpenSubpage: envProjectOpenSubpage,
      };
    },
    beforeCreate() {
      // set title and favicon
      document.title = envTitle;
      changeFavicon(envFaviconURL);
    },
  });

  app.directive("clipboard", {
    beforeMount(el: HTMLElement) {
      // create the clipboard button
      const clipboardButton = document.createElement("button");
      clipboardButton.setAttribute("type", "button");
      clipboardButton.classList.add(
        "v-icon",
        "notranslate",
        "fa",
        "fa-copy",
        "clipboard-directive-button-class",
        "mr-2",
        "align-self-center",
        "v-icon--size-small",
      );
      // add it behind the input element
      const textFieldSlotElement = el.querySelector(".v-field__field");
      textFieldSlotElement?.appendChild(clipboardButton);
      // register the click callback
      const inputElement = el.querySelector("input");
      const clipboard = new Clipboard(clipboardButton, {
        text: () => inputElement?.value ?? "",
      });
      clipboard.on("success", () => {
        clipboardButton.classList.remove("fa-copy");
        clipboardButton.classList.add("fa-check");
        setTimeout(() => {
          clipboardButton.classList.remove("fa-check");
          clipboardButton.classList.add("fa-copy");
        }, 2000);
      });
    },
    unmounted(el: HTMLElement) {
      // remove the clipboard button from the DOM
      const clipboardButton = el.querySelector(".clipboard-directive-button-class");
      clipboardButton?.remove();
    },
  });

  // resolves initial navigation and provides the $router object to all components
  await router.isReady();

  app.mount("#app");
}
