import { computed } from "vue";
import { useStore } from "vuex";

import { IDevice } from "@/store/modules/devices/types";
import { RootState } from "@/store/types";

type CommonDeviceProps = { isPreview: boolean; deviceData: IDevice };

const useCommonDevice = (props: CommonDeviceProps) => {
  const store = useStore();

  const measurementsState = computed(() => {
    return (store.state as RootState).measurements;
  });

  const measurements = computed(() => {
    return measurementsState.value.measurements;
  });
  const langPath = computed(() => {
    return `devices.${props.deviceData!.data.type}`;
  });

  return { measurements, langPath, measurementsState };
};

export { CommonDeviceProps, useCommonDevice };
