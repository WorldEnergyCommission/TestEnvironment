import { Ref, computed, reactive, ref } from "vue";
import { useTheme } from "vuetify/lib/framework.mjs";

export const usePreviewImage = (devicetype: string | Ref<string>) => {
  const _devicetype = ref(devicetype);
  const { current: theme } = useTheme();

  const currentSelectedTheme = computed(() => (theme.value.dark ? "themeDark" : "themeLight"));

  /**
   * Define Anomaly Detection preview image according to type
   * @return path to preview image or null if Anomaly Detection don`t have it
   */
  const currentPreviewImage = computed(() => {
    if (!_devicetype.value) {
      return null;
    }

    return `assets/images/previews/${currentSelectedTheme.value}/${_devicetype.value}.png`;
  });
  return { currentPreviewImage };
};
