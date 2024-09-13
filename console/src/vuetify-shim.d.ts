declare module "vuetify/lib/services/goto" {
  import Vue from "vue";
  export default function goTo<T extends string | number | HTMLElement | typeof Vue>(
    target: T,
    options?: any,
  ): any;
}
