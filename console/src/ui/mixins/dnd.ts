import { defineComponent } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import { IProject } from "@/store/modules/projects/types";

export interface IDnDSize {
  w: number;
  h: number;
}

export interface IDnDPosition {
  x: number;
  y: number;
  i: string;
}

export interface IDeviceDnDLayout extends IDnDPosition, IDnDSize {
  device: IDevice;
  moved?: boolean;
}

export const DND = defineComponent({
  methods: {
    /**
     * Returns device dimensions according to type,
     * which used in Drag and Drop grid on Favorites, Rooms pages
     * @param componentType type of device, MPC
     * @return object with props w (width), h (height)
     */
    sizesForDnD(componentType: string) {
      const devicesSizesForDnD: Record<string | number | symbol, IDnDSize> = {
        GaugeChart: { w: 2, h: 2 },
        ControlBlinds: { w: 1, h: 2 },
        MotorWithoutVFD: { w: 1, h: 2 },
        WeatherStation: { w: 1, h: 2 },
        MotionSensor: { w: 1, h: 2 },
        Gauge: { w: 1, h: 2 },
        MusicSystem: { w: 1, h: 2 },
        MotorWithVFD: { w: 1, h: 2 },
        PumpWithoutVFD: { w: 1, h: 2 },
        PumpWithVFD: { w: 1, h: 2 },
        MixingValve: { w: 1, h: 2 },
        Ventilation: { w: 1, h: 2 },
        TSGFrischwasser: { w: 2, h: 2 },
        TSGBrauchwasser: { w: 2, h: 2 },
        PVProductionService: { w: 1, h: 2 },
        PVMonitoringService: { w: 1, h: 2 },
        ConsumptionService: { w: 1, h: 2 },
        EnergyDevice: { w: 4, h: 4 },
        EMS: { w: 4, h: 5 },
        SSP: { w: 2, h: 5 },
        TSGLadestationNotAus: { w: 1, h: 2 },
        KineticPower: { w: 4, h: 5 },
        SetpointOptimizer: { w: 2, h: 5 },
        TSGModulLadestation: { w: 1, h: 2 },
        EnergyViewModule: { w: 2, h: 4 },
        EaseeWallbox: { w: 1, h: 2 },
        WeekTrendSummary: { w: 4, h: 3 },
      };
      const isChart = (type: string) => {
        const charts = [
          "HistoryAnomalyDetection",
          "StreamAnomalyDetection",
          "chart",
          "LoadMonitor",
          "BakingMonitor",
        ];
        return charts.some((item: string) => item === type) ? { w: 4, h: 4 } : false;
      };
      return devicesSizesForDnD[componentType] || isChart(componentType) || { w: 1, h: 1 };
    },
  },
});
