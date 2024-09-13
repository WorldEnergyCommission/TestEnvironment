import { useI18n } from "vue-i18n";

interface DateTimeFormatOptions {
  formatMatcher?: "basic" | "best fit" | "best fit" | undefined;
  dateStyle?: "full" | "long" | "medium" | "short" | undefined;
  timeStyle?: "full" | "long" | "medium" | "short" | undefined;
  dayPeriod?: "narrow" | "short" | "long" | undefined;
  fractionalSecondDigits?: 1 | 2 | 3 | undefined;
}

export const useIntlDate = () => {
  const i18nLocale = useI18n();

  function formatDateShort(date: Date, options: DateTimeFormatOptions = { dateStyle: "short" }) {
    return Intl.DateTimeFormat(i18nLocale.locale.value, options).format(date);
  }

  function formatDateForChart(date: number, onlyDate: boolean = false) {
    if (isNaN(date)) {
      return "";
    }

    // const optionsDate: Intl.DateTimeFormatOptions = {
    //   weekday: "long", // "long", "short", "narrow"
    //   day: "2-digit", // "numeric", "2-digit"
    //   month: "short", // "numeric", "2-digit", "long", "short", "narrow"
    //   year: "numeric", // "numeric", "2-digit"
    // };

    const optionsDate: Intl.DateTimeFormatOptions = {
      day: "numeric", // "numeric", "2-digit"
      month: "short", // "numeric", "2-digit", "long", "short", "narrow"
      year: "numeric", // "numeric", "2-digit"
    };

    const optionsTime: Intl.DateTimeFormatOptions = {
      hour: "2-digit", // "numeric", "2-digit"
      minute: "numeric", // "numeric", "2-digit"
    };

    let dateString = Intl.DateTimeFormat(i18nLocale.locale.value, optionsDate).format(
      new Date(date),
    );
    const timeString = Intl.DateTimeFormat(i18nLocale.locale.value, optionsTime).format(
      new Date(date),
    );

    dateString = dateString.replace(/,/g, "");

    if (onlyDate) {
      return dateString;
    }

    return dateString.replace(/,/g, "") + " @ " + timeString;
  }

  return { formatDateShort, formatDateForChart };
};
