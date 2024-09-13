import { i18nInstance } from "@/ui/plugins/i18n";

export const rules = {
  required: (value: any) => !!value || i18nInstance.t("validationRules.required"),
  min: (v: string | any[]) => v.length >= 4 || i18nInstance.t("validationRules.atLeast4Char"),
  emailMatch: () => i18nInstance.t("validationRules.emailPWMatch"),
  email: (value: string) => {
    const pattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(value) || i18nInstance.t("validationRules.emailInvalid");
  },
  counter30: (value: { length: number }) =>
    value.length <= 30 || i18nInstance.t("validationRules.fieldLessThan30"),
  number: (v: any) => {
    try {
      if (!isNaN(parseFloat(v))) {
        console.log(parseFloat(v));
        console.log(isNaN(parseFloat(v)));
        console.log("is not valid");
        return true;
      }
    } catch {
      return "Input has to be a number";
    }
    console.log("wat is happening");
  },
  fieldMoreThanNull: (value: number) =>
    value >= 0 || i18nInstance.t("validationRules.fieldMoreThanNull"),
  fieldMoreThanOneTenth: (value: number) =>
    value >= 0.1 || i18nInstance.t("validationRules.fieldMoreThanOneTenth"),
  fieldMoreThan25: (value: number) =>
    value >= 25 || i18nInstance.t("validationRules.fieldMoreThan25"),
  fieldMoreThan15: (value: number) =>
    value >= 15 || i18nInstance.t("validationRules.fieldMoreThan15"),
  fieldMoreThan5: (value: number) => value >= 5 || i18nInstance.t("validationRules.fieldMoreThan5"),
  fieldMoreThan1: (value: number) => value >= 1 || i18nInstance.t("validationRules.fieldMoreThan1"),
  fieldLessThan10: (value: number) =>
    value <= 10 || i18nInstance.t("validationRules.fieldLessThan10"),
  fieldLessThan20: (value: number) =>
    value <= 20 || i18nInstance.t("validationRules.fieldLessThan20"),
  fieldLessThan30: (value: number) =>
    value <= 30 || i18nInstance.t("validationRules.fieldLessThan30"),
  fieldLessThan50: (value: number) =>
    value <= 50 || i18nInstance.t("validationRules.fieldLessThan50"),
  fieldLessThan75: (value: number) =>
    value <= 75 || i18nInstance.t("validationRules.fieldLessThan75"),
  fieldLessThan100: (value: number) =>
    value <= 100 || i18nInstance.t("validationRules.fieldLessThan100"),
  fieldLessThan120: (value: number) =>
    value <= 120 || i18nInstance.t("validationRules.fieldLessThan120"),
  fieldLessThan255: (value: number) =>
    value <= 255 || i18nInstance.t("validationRules.fieldLessThan255"),
  fieldLessThan500: (value: number) =>
    value <= 500 || i18nInstance.t("validationRules.fieldLessThan500"),
  fieldLessThan600: (value: number) =>
    value <= 600 || i18nInstance.t("validationRules.fieldLessThan600"),
  fieldLessThan1000: (value: number) =>
    value <= 1000 || i18nInstance.t("validationRules.fieldLessThan1000"),
  fieldLessThan1200: (value: number) =>
    value <= 1200 || i18nInstance.t("validationRules.fieldLessThan1200"),
  fieldLessThan2000: (value: number) =>
    value <= 2000 || i18nInstance.t("validationRules.fieldLessThan2000"),

  // time
  fieldHours: (value: number) => value <= 23 || i18nInstance.t("validationRules.fieldHours"),
  fieldMinutes: (value: number) => value <= 59 || i18nInstance.t("validationRules.fieldMinutes"),
  fieldTimeInHHMM: (value: string) =>
    /^(([0-1]?[0-9]|2[0-3]):[0-5][0-9])$/.test(value) ||
    /^24:00$/.test(value) ||
    i18nInstance.t("validationRules.fieldTimeInHHMM"),
  timeWithoutEndOfDay: (value: string) => value !== "24:00" || "🚫 24:00",

  // specific
  twoComas: (value: any) => {
    const pattern = /^\-?\d+(?:\.\d{1,2})?$/;
    return pattern.test(value) || i18nInstance.t("validationRules.twoComas");
  },
  oneComa: (value: any) => {
    const pattern = /^\-?\d+(?:\.\d{1})?$/;
    return pattern.test(value) || i18nInstance.t("validationRules.oneComa");
  },
};
