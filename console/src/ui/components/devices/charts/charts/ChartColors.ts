import { cloneDeep } from "lodash";
import tinycolor from "tinycolor2";
import { computed } from "vue";
import { useTheme } from "vuetify/lib/framework.mjs";

export default class ChartColors {
  private static readonly baseColors = [
    tinycolor("#0f72ba"),
    tinycolor("#00c853"),
    tinycolor("#f57c00"),
    tinycolor("#8085e9"),
    tinycolor("#f34848"),
    tinycolor("#2baae2"),
    tinycolor("#009688"),
    tinycolor("#ee3562"),
    tinycolor("#7cb342"),
  ];

  static colors(isDarkTheme: boolean): string[] {
    const colors = cloneDeep(ChartColors.baseColors);
    return isDarkTheme
      ? colors.map((e: any) => e.lighten(7).toHexString())
      : colors.map((e: any) => e.darken(2).toHexString());
  }
}

export function useChartColors() {
  // Get the theme
  const { current: theme } = useTheme();

  // Init basecolors
  const chartColors = [
    tinycolor("#0f72ba"),
    tinycolor("#00c853"),
    tinycolor("#f57c00"),
    tinycolor("#8085e9"),
    tinycolor("#f34848"),
    tinycolor("#2baae2"),
    tinycolor("#009688"),
    tinycolor("#ee3562"),
    tinycolor("#7cb342"),
  ];

  // Create light and dark clones of the basecolors
  const chartColorsDark = cloneDeep(chartColors).map((color) => color.darken(10));
  const chartColorsLight = cloneDeep(chartColors).map((color) => color.lighten(10));

  // Define the Return values as computed
  const colors = computed(() => {
    if (theme.value.dark) {
      return cloneDeep(chartColors).map((color) => color.lighten(10).toHexString());
    } else {
      return cloneDeep(chartColors).map((color) => color.toHexString());
    }
  });

  const colorsDark = computed(() => {
    if (theme.value.dark) {
      return cloneDeep(chartColorsDark).map((color) => color.lighten(10).toHexString());
    } else {
      return cloneDeep(chartColorsDark).map((color) => color.toHexString());
    }
  });

  const colorsLight = computed(() => {
    if (theme.value.dark) {
      return cloneDeep(chartColorsLight).map((color) => color.lighten(10).toHexString());
    } else {
      return cloneDeep(chartColorsLight).map((color) => color.toHexString());
    }
  });

  const gridColor = computed(() => (theme.value.dark ? "#ffffff" : "#000000"));
  const tickColor = computed(() => (theme.value.dark ? "#aaaaaa" : "#333333"));

  return { colors, colorsDark, colorsLight, gridColor, tickColor };
}
