// import necessary styles
import "@fortawesome/fontawesome-free/css/all.css";
import "@mdi/font/css/materialdesignicons.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import "leaflet/dist/leaflet.css";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css";
import "@fontsource/clear-sans";
import "./ui/scss/main.scss";

import { SplashScreen } from "@capacitor/splash-screen";

import { setupAppId } from "@/utils/appBootstrapFunctions";
import { checkAndUpdateApp } from "@/utils/appUpdateFunctions";

SplashScreen.show().then(
  () =>
    checkAndUpdateApp().then(
      () => {
        setupAppId().then(
          () => {
            import("@/utils/webBootstrapFunctions").then(
              (wbf) => {
                wbf.setupVue().then(
                  () => {
                    SplashScreen.hide().then(
                      () => {},
                      (err) => {
                        console.log(err);
                      },
                    );
                  },
                  (err) => {
                    console.log(err);
                  },
                );
              },
              (err) => {
                console.log(err);
              },
            );
          },
          (err) => {
            console.log(err);
          },
        );
      },
      (err) => console.log(err),
    ),
  (err) => {
    console.log(err);
  },
);
