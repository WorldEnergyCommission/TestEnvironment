import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";

export const Validation = defineComponent({
  computed: {
    /**
     * Rules which used in different form fields of project
     */
    rules() {
      return {
        required: (value: number) => value === 0 || !!value || this.$t("validationRules.required"),
        fieldMoreThanNull: (value: number) =>
          value >= 0 || this.$t("validationRules.fieldMoreThanNull"),
        fieldMoreThanOneTenth: (value: number) =>
          value >= 0.1 || this.$t("validationRules.fieldMoreThanOneTenth"),
        fieldMoreThan25: (value: number) =>
          value >= 25 || this.$t("validationRules.fieldMoreThan25"),
        fieldMoreThan15: (value: number) =>
          value >= 15 || this.$t("validationRules.fieldMoreThan15"),
        fieldMoreThan5: (value: number) => value >= 5 || this.$t("validationRules.fieldMoreThan5"),
        fieldMoreThan1: (value: number) => value >= 1 || this.$t("validationRules.fieldMoreThan1"),
        fieldLessThan10: (value: number) =>
          value <= 10 || this.$t("validationRules.fieldLessThan10"),
        fieldLessThan20: (value: number) =>
          value <= 20 || this.$t("validationRules.fieldLessThan20"),
        fieldLessThan30: (value: number) =>
          value <= 30 || this.$t("validationRules.fieldLessThan30"),
        fieldLessThan50: (value: number) =>
          value <= 50 || this.$t("validationRules.fieldLessThan50"),
        fieldLessThan75: (value: number) =>
          value <= 75 || this.$t("validationRules.fieldLessThan75"),
        fieldLessThan100: (value: number) =>
          value <= 100 || this.$t("validationRules.fieldLessThan100"),
        fieldLessThan120: (value: number) =>
          value <= 120 || this.$t("validationRules.fieldLessThan120"),
        fieldLessThan255: (value: number) =>
          value <= 255 || this.$t("validationRules.fieldLessThan255"),
        fieldLessThan500: (value: number) =>
          value <= 500 || this.$t("validationRules.fieldLessThan500"),
        fieldLessThan600: (value: number) =>
          value <= 600 || this.$t("validationRules.fieldLessThan600"),
        fieldLessThan1000: (value: number) =>
          value <= 1000 || this.$t("validationRules.fieldLessThan1000"),
        fieldLessThan1200: (value: number) =>
          value <= 1200 || this.$t("validationRules.fieldLessThan1200"),
        fieldLessThan2000: (value: number) =>
          value <= 2000 || this.$t("validationRules.fieldLessThan2000"),

        // time
        fieldHours: (value: number) => value <= 23 || this.$t("validationRules.fieldHours"),
        fieldMinutes: (value: number) => value <= 59 || this.$t("validationRules.fieldMinutes"),
        fieldTimeInHHMM: (value: string) =>
          /^(([0-1]?[0-9]|2[0-3]):[0-5][0-9])$/.test(value) ||
          /^24:00$/.test(value) ||
          this.$t("validationRules.fieldTimeInHHMM"),
        timeWithoutEndOfDay: (value: string) => value !== "24:00" || "🚫 24:00",

        // specific
        twoComas: (value: any) => {
          const pattern = /^\-?\d+(?:\.\d{1,2})?$/;
          return pattern.test(value) || this.$t("validationRules.twoComas");
        },
        oneComa: (value: any) => {
          const pattern = /^\-?\d+(?:\.\d{1})?$/;
          return pattern.test(value) || this.$t("validationRules.oneComa");
        },
      };
    },
  },
});

export function useValidationRules() {
  const { t } = useI18n();

  const rules = {
    required: (value: number) => value === 0 || !!value || t("validationRules.required"),
    fieldMoreThanNull: (value: number) => value >= 0 || t("validationRules.fieldMoreThanNull"),
    fieldMoreThanOneTenth: (value: number) =>
      value >= 0.1 || t("validationRules.fieldMoreThanOneTenth"),

    fieldMoreThan25: (value: number) => value >= 25 || t("validationRules.fieldMoreThan25"),
    fieldMoreThan15: (value: number) => value >= 15 || t("validationRules.fieldMoreThan15"),
    fieldMoreThan5: (value: number) => value >= 5 || t("validationRules.fieldMoreThan5"),
    fieldMoreThan1: (value: number) => value >= 1 || t("validationRules.fieldMoreThan1"),
    fieldLessThan10: (value: number) => value <= 10 || t("validationRules.fieldLessThan10"),
    fieldLessThan20: (value: number) => value <= 20 || t("validationRules.fieldLessThan20"),
    fieldLessThan30: (value: number) => value <= 30 || t("validationRules.fieldLessThan30"),
    fieldLessThan50: (value: number) => value <= 50 || t("validationRules.fieldLessThan50"),
    fieldLessThan75: (value: number) => value <= 75 || t("validationRules.fieldLessThan75"),
    fieldLessThan100: (value: number) => value <= 100 || t("validationRules.fieldLessThan100"),
    fieldLessThan120: (value: number) => value <= 120 || t("validationRules.fieldLessThan120"),
    fieldLessThan255: (value: number) => value <= 255 || t("validationRules.fieldLessThan255"),
    fieldLessThan500: (value: number) => value <= 500 || t("validationRules.fieldLessThan500"),
    fieldLessThan600: (value: number) => value <= 600 || t("validationRules.fieldLessThan600"),
    fieldLessThan1000: (value: number) => value <= 1000 || t("validationRules.fieldLessThan1000"),
    fieldLessThan1200: (value: number) => value <= 1200 || t("validationRules.fieldLessThan1200"),
    fieldLessThan2000: (value: number) => value <= 2000 || t("validationRules.fieldLessThan2000"),
    fieldLessThan: (num: number) => (value: number) =>
      value <= num || `${t("validationRules.fieldLessThan")} ${num}`,

    // time
    fieldHours: (value: number) => value <= 23 || t("validationRules.fieldHours"),
    fieldMinutes: (value: number) => value <= 59 || t("validationRules.fieldMinutes"),
    fieldTimeInHHMM: (value: string) =>
      /^(([0-1]?[0-9]|2[0-3]):[0-5][0-9])$/.test(value) ||
      /^24:00$/.test(value) ||
      t("validationRules.fieldTimeInHHMM"),
    timeWithoutEndOfDay: (value: string) => value !== "24:00" || "🚫 24:00",

    // specific
    twoComas: (value: any) => {
      const pattern = /^\-?\d+(?:\.\d{1,2})?$/;
      return pattern.test(value) || t("validationRules.twoComas");
    },
    oneComa: (value: any) => {
      const pattern = /^\-?\d+(?:\.\d{1})?$/;
      return pattern.test(value) || t("validationRules.oneComa");
    },
  };
  return rules;
}
