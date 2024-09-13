import { useElementSize } from "@vueuse/core";
import { throttle } from "lodash";
import { defineComponent, PropType, ref } from "vue";

import { RootState } from "@/store/types";
import {
  DeviceTypeKeys,
  EMSSystemType,
  SystemData,
  SystemTypeString,
  alternativeColor,
  defaultArrowMovementFromPointToCenter,
  defaultColor,
  emsIcons,
  systemMLMappings,
} from "@/ui/components/devices/devices/EnergyViewDevice/EnergyViewSystems";

/**
 * Props for EMS Systems
 */
export interface CommonSystemProps {
  systemData: Record<string, SystemData>;
  systemCount: number;
  canvasSize: any;
  canvasCenter: any;
  lineData: any;
  lineReady: boolean;
  disableSystemSettings: boolean;
  systemTypeString: SystemTypeString | EMSSystemType;
  icon: string;
  systemTitle: string;
}

/**
 * Common logic for the EMS systems - can be reused by custom systems
 * like battery and heat meter.
 * Template is in EMSSystem.vue
 */
export default defineComponent({
  props: {
    systemProps: {
      type: Object as PropType<CommonSystemProps>,
    },
    fromPointToCenterDefault: { default: false, type: [Boolean, Number] },
    lineColor: { default: "#f3db04", type: String },
    lineColorReverse: { default: "#f3db04", type: String },
    isPreview: {
      default: false,
      type: Boolean,
    },
  },
  setup() {
    const instancesCanvas = ref(null);
    const { width, height } = useElementSize(instancesCanvas);

    return { instancesCanvas, containerWidth: width, containerHeight: height };
  },
  data() {
    const instancesCanvasLines: any = {};
    const instancesCanvasCenter: any = null;
    const instancesCanvasSize: any = null;

    return {
      instancesCanvasSize,
      instancesCanvasCenter,
      instancesCanvasLines,
      tab: 0,
      getInstancesCoordsThrottle: throttle(() => this.getInstancesCoords(), 500),
      renderKey: 0,
    };
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    icon() {
      return emsIcons[this.systemProps!.systemTypeString];
    },
    getSystemTypeTitle() {
      let mlModelSystemName = this.systemProps!.systemTypeString as string;
      if ((DeviceTypeKeys as string[]).includes(this.systemProps!.systemTypeString)) {
        mlModelSystemName = (systemMLMappings as Record<string, string>)[
          this.systemProps!.systemTypeString
        ];
      }
      return this.$t(`mlModel.EMS.systems.${mlModelSystemName}.title`);
    },
    defaultPointColor() {
      return defaultColor[this.systemProps!.systemTypeString];
    },
    alternativePointColor() {
      return alternativeColor[this.systemProps!.systemTypeString];
    },
    defaultMovement() {
      return defaultArrowMovementFromPointToCenter[this.systemProps!.systemTypeString];
    },
    allSystemsArray() {
      return Object.keys(this.systemProps!.systemData);
    },
    /**
     * Groups the number of items in a group of 10
     * @return {array} [[1, 2, ... 10], [1, 2, 3, 4]]
     */
    pagedObject() {
      if (this.allSystemsArray.length > 10) {
        const clone: any = [...this.allSystemsArray];
        const arr: any = [];
        while (clone.length) {
          arr.push(clone.splice(0, 10));
        }
        return arr;
      } else {
        return [this.allSystemsArray];
      }
    },
    numberOfPages() {
      return this.pagedObject.length;
    },
    instancesTopLineFiltered() {
      return this.pagedObject[this.tab].slice(0, 5);
    },
    instancesBottomLineFiltered() {
      return this.pagedObject[this.tab].slice(5, 10);
    },
    measurements() {
      if (this.isPreview) {
        return { get: () => Math.round(Math.random() * 100 * 100) / 100 };
      }
      return this.measurementsState.measurements;
    },
    /**
     * Load line if all coords and sizes ready
     * @return {boolean} load line status
     */
    isDataForInstancesAnimatedLineReady() {
      return (
        !!this.instancesCanvasSize &&
        !!this.instancesCanvasCenter &&
        !!Object.values(this.instancesCanvasLines)
      );
    },
    /**
     * Retrieving and grouping error and warning status values.
     * @return {number} error, warning status. can be 1 or 2
     */
    showEventGroup() {
      const res = Object.values(this.systemProps!.systemData).map((system) =>
        this.measurements.get(system.error),
      );
      const filtered: any = res.filter((meas: any) => typeof meas === "number");
      return Math.max.apply(null, filtered);
    },
    /**
     * Average for battery
     */
    avg() {
      const res = Object.values(this.systemProps!.systemData).map((item: any) =>
        this.measurements.get(item.soc),
      );
      const filtered: any = res.filter((el: any) => typeof el === "number");
      return filtered.length ? filtered.reduce((a: any, b: any) => a + b) / filtered.length : null;
    },
  },
  watch: {
    renderKey: [
      {
        handler: "getInstancesCoords",
      },
    ],
    tab: [
      {
        handler: "handleSystemModalWindowContent",
      },
    ],
    systemProps: [{ deep: true, handler: "handleMappingChanges" }],
    containerWidth: [{ handler: "handleMappingChanges" }],
    containerHeight: [{ handler: "handleMappingChanges" }],
  },
  mounted() {
    this.handleMappingChanges();
  },
  methods: {
    /**
     * Creates range for navigation tab name
     * @param {number} page index of current page
     * @param {number} lastPage index of last page in list
     */
    defineTabTitle(page: number, lastPage: number) {
      const start: any = page * 10 - 9;
      const end: any = page * 10;
      const isCurrentPageLast: boolean = page === lastPage;
      const allSystemsCount: any = Object.values(this.systemProps!.systemData)?.length;
      return `${start} - ${isCurrentPageLast ? allSystemsCount : end}`;
    },
    /**
     * Defines coordinates of systems, central endpoint.
     * Use vm.$refs to retrieve references to elements.
     * Then it goes through the list of references and creates an options object for each one.
     */
    async getInstancesCoords() {
      await this.$nextTick();
      const central = this.$refs.instancesCentralEndpoint as HTMLElement;
      const actualViewRef = this.$refs.instancesCanvas as HTMLElement;

      if (!central || !actualViewRef) {
        return;
      }

      this.instancesCanvasSize = {
        width: actualViewRef?.clientWidth,
        height: actualViewRef?.clientHeight,
      };
      this.instancesCanvasCenter = {
        x: central.offsetLeft + central.offsetWidth / 2,
        y: central.offsetTop + central.offsetHeight / 2,
        w: central.offsetWidth,
        h: central.offsetHeight,
      };

      Object.keys(this.systemProps!.systemData).forEach((system) => {
        const target: any = this.$refs[system];
        if (!target || !target.length) return;

        this.instancesCanvasLines[system] = {
          key: system,
          x: target[0].offsetLeft + target[0].offsetWidth / 2,
          y: target[0].offsetTop + target[0].offsetHeight / 2,
          w: target[0].offsetWidth,
          h: target[0].offsetHeight,
        };
      });
    },
    /**
     * When you open the system grid window,
     * get the current coordinates of the systems, central endpoint.
     * Define sizes.
     * @param {boolean} isContentVisible system grid visible status
     */
    async handleSystemModalWindowContent(isContentVisible: boolean) {
      if (isContentVisible) {
        await this.$nextTick();
        this.handleMappingChanges();
      }
    },
    handleMappingChanges() {
      this.renderKey++;
    },
  },
});
