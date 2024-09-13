import moment from "moment";
import "moment/locale/de";
import "moment/locale/it";
import { mergeProps, defineComponent } from "vue";

import { RootState } from "@/store/types";

/**
 * Common logic for localisation
 */
export default defineComponent({
  props: {
    offsetY: { default: true, type: Boolean },
    offsetX: { default: false, type: Boolean },
    iconSizes: { default: 16, type: Number },
  },
  data() {
    return {
      selectedLanguage: 0,
    };
  },
  computed: {
    appState() {
      return (this.$store.state as RootState).app;
    },
    /**
     * Get all supported languages
     */
    languages() {
      return [
        { title: "uiComponents.localisationLanguagesList.en", locale: "en" },
        { title: "uiComponents.localisationLanguagesList.de", locale: "de" },
        { title: "uiComponents.localisationLanguagesList.it", locale: "it" },
      ];
    },
    /**
     * Get the current user
     */
    user() {
      return this.appState.user;
    },
    /**
     * Get the default locale for the browser
     */
    defaultLocale() {
      return navigator.language.split("-")[0] ?? "en";
    },
  },
  /**
   * Initialize the local storage with a suitable language
   */
  mounted() {
    const locale = this.loadLocale();
    this.selectedLanguage = this.languages.findIndex((el: any) => el.locale === locale) ?? 0;
    this.saveLocale(locale);
  },
  methods: {
    /**
     * Save current locale in browser local storage
     */
    saveLocale(locale: string) {
      const currentLynusLocales = JSON.parse(localStorage.getItem("lynusLocales") ?? "{}");
      const newLynusLocales = { ...currentLynusLocales, [this.user.id]: locale };
      localStorage.setItem("lynusLocales", JSON.stringify(newLynusLocales));
      this.setLocale(locale);
    },
    /**
     * Load current locale from browser local storage
     */
    loadLocale(): string {
      const lynusLocales = JSON.parse(localStorage.getItem("lynusLocales") ?? "{}");
      const locale = lynusLocales[this.user.id] ?? this.defaultLocale;
      this.setLocale(locale);
      return locale;
    },
    /**
     * Set locale in moment and i18n
     */
    setLocale(locale: string) {
      this.$i18n.locale = locale;
      document.querySelector("html").setAttribute("lang", locale);
      moment.locale(locale);
    },
    /**
     * Save the selected locale
     */
    handleLocale(index: number) {
      this.selectedLanguage = index;
      const locale = this.languages[this.selectedLanguage].locale;
      this.saveLocale(locale);
    },
    propsMerge(a: any, b: any) {
      return mergeProps(a, b);
    },
  },
});
