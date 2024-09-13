import { computed, ref, watch } from "vue";

import { IDevice } from "@/store/modules/devices/types";

export const useCommonDeviceModalState = (
  deviceData: IDevice,
  handleClose: (e: "close") => void,
) => {
  const dialog = ref<boolean>(false);
  const deviceFormView = ref<boolean>(false);
  const deviceType = ref({ title: "", value: "" });

  // Sets the v-if propertie "display" to false in order to hide the dialog
  function closeDialog() {
    dialog.value = false;
  }

  function onDialogChange(val: boolean) {
    if (val) {
      deviceFormView.value = !!deviceData.data.type;
      deviceType.value.value = deviceData.data.type;
    } else {
      deviceFormView.value = false;
      deviceType.value = { title: "", value: "" };

      handleClose;
    }
  }

  // Steps validation
  const nameTypeValidation = computed(() => {
    return !!deviceType.value.value?.length;
  });

  // Watchers
  watch(
    () => dialog.value,
    () => {
      onDialogChange(dialog.value);
    },
  );

  return { deviceType, dialog, deviceFormView, closeDialog, onDialogChange, nameTypeValidation };
};
