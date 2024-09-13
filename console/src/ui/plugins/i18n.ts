import { createI18n } from "vue-i18n";
import { en, de, it } from "vuetify/locale";

import languages from "@/lang";

const datetimeFormats: any = {
  en: {
    short: {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
    long: {
      month: "long",
      day: "numeric",
      weekday: "long",
    },
  },
  de: {
    short: {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
    long: {
      month: "long",
      day: "numeric",
      weekday: "long",
    },
  },
  it: {
    short: {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
    long: {
      month: "long",
      day: "numeric",
      weekday: "long",
    },
  },
};

const langWVuetify = {
  en: {
    ...languages.en,
    $vuetify: {
      ...en,
    },
  },
  de: {
    ...languages.de,
    $vuetify: {
      ...de,
    },
  },
  it: {
    ...languages.it,
    $vuetify: {
      ...it,
    },
  },
};

type MessageSchema = typeof langWVuetify.en;
type Languages = keyof typeof langWVuetify;

export const i18n = createI18n<[MessageSchema], Languages>({
  locale: "en",
  fallbackLocale: "en",
  messages: langWVuetify,
  datetimeFormats,
  legacy: false,
  // allowComposition: true,
  // legacy: true,
  // globalInjection: true,
});

export const i18nInstance = i18n.global;
