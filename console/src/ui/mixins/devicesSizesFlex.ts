import { defineComponent } from "vue";

export const DevicesSizesFlex = defineComponent({
  methods: {
    /**
     * Returns device dimensions according to type,
     * which used in flex grid on Favorites, Rooms pages
     * @param deviceType type of device
     * @return object with props md (1-12), sm (1-12), xs (1-12)
     */
    defineFlexSizesByDeviceType(deviceType: string) {
      const customSizes: any = {
        chart: { md: 12, sm: 12, xs: 12 },
        HistoryAnomalyDetection: { md: 12, sm: 12, xs: 12 },
        StreamAnomalyDetection: { md: 12, sm: 12, xs: 12 },
        LiveAnomalyDetection: { md: 12, sm: 12, xs: 12 },
        Gauge: { md: 12, sm: 12, xs: 12 },
        TSGFrischwasser: { md: 12, sm: 12, xs: 12 },
        TSGBrauchwasser: { md: 12, sm: 12, xs: 12 },
        EnergyView: { md: 12, sm: 12, xs: 12 },
        EMS: { md: 12, sm: 12, xs: 12 },
        KineticPower: { md: 12, sm: 12, xs: 12 },
        SetpointOptimizer: { md: 12, sm: 12, xs: 12 },
      };
      return customSizes[deviceType] || { md: 6, sm: 12, xs: 12 };
    },
  },
});
