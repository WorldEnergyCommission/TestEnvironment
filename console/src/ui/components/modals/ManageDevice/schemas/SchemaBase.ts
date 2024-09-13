import { toRaw, defineComponent, PropType } from "vue";

import api from "@/store/api";
import { defaultMappings } from "@/store/modules/devices/settings/deviceMappingDefaults";
import { IDevice } from "@/store/modules/devices/types";
import { IProject } from "@/store/modules/projects/types";
import { IRoom } from "@/store/modules/rooms/types";
import { AddRulesPayload, DeleteRulePayload } from "@/store/modules/rules/types";
import { RootState } from "@/store/types";
import { Icon } from "@/ui/components/components/IconList.vue";
import { envDomain } from "@/utils/env";

/**
 * Common logic for the modals to create or modify a specific device
 */
export default defineComponent({
  props: {
    deviceData: {
      default: () => ({
        name: "",
        data: {
          type: "",
          mappings: {},
        },
        collection_id: "",
      }),
      type: Object as PropType<IDevice>,
    },
    isEditModal: {
      type: Boolean,
    },
    activeRoomId: { default: "", type: String },
  },
  data() {
    const iconObject = undefined as Icon | undefined;
    const icons = [] as Icon[];
    const device: any = null;
    const domain: string = envDomain;

    return {
      domain,
      stage: 1,
      device,
      showOptionalFields: false,
      icons,
      iconObject,
    };
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    devicesState() {
      return (this.$store.state as RootState).devices;
    },
    deviceSchema() {
      return this.devicesTypes[this.deviceData.data.type];
    },
    /**
     * Override in KineticPowerSchema
     */
    deviceMappings() {
      return this.deviceSchema.mappings;
    },
    deviceMappingsList() {
      if (this.device?.data?.type) {
        return Object.keys(this.deviceSchema.mappings);
      }
      return [];
    },
    isDeviceNameValid() {
      return !!this.device?.name?.length;
    },
    /**
     * Validate length of collection_id
     * through shorthand boolean cast */
    settingsValidation() {
      return !!this.device.collection_id.length;
    },
    /**
     * Get all keys of measurements from store
     * */
    measurementsKeysList() {
      return this.measurementsState.measurementsKeys;
    },
    /**
     * Sort the list of rooms by number in name and alphabetically
     * @return list of rooms
     */
    sortedRooms() {
      const sortFn = (a: any, b: any) => {
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
        return 0;
      };
      const filteredByFirstNumbers = this.rooms.filter((room: any) => {
        const filt = /^[0-9]{1,}/g;
        return filt.test(room.name);
      });
      const sortedByNumbers = filteredByFirstNumbers.sort((a: any, b: any) => {
        const aName = a.name.match(/^[0-9]{1,}/g, "");
        const bName = b.name.match(/^[0-9]{1,}/g, "");
        if (+aName > +bName) return 1;
        if (+aName < +bName) return -1;
        return 0;
      });
      const othersRooms = this.rooms
        .filter((room: any) => {
          const filt = /^[0-9]{1,}/g;
          return !filt.test(room.name);
        })
        .sort(sortFn);
      return [...sortedByNumbers, ...othersRooms];
    },
    /**
     * Checks mappings if they not valid
     * Override in Energy Schema
     * @return true if mapping filled, else false
     */
    mappingValidation() {
      if (this.stage === 2) {
        const optionalFields = Object.entries(this.deviceMappings)
          .filter((field: any) => !field[1].optional)
          .map((field: any) => field[0]);
        return optionalFields
          .map((el: any) => this.device.data.mappings[el])
          .every((el: any) => el);
      } else {
        return false;
      }
    },
    rooms(): IRoom[] {
      return this.$store.getters["rooms/rooms"];
    },
    project(): IProject {
      return (this.$store.state as RootState).projects.project;
    },
    devicesTypes(): any {
      return this.$store.getters["devices/devicesTypes"];
    },
  },
  watch: {
    stage: [
      {
        handler: "onStageChange",
      },
    ],
  },
  methods: {
    removeIcon() {
      this.device.data.meta.cover = "";
    },
    iconTheme() {
      return { filter: this.$vuetify.theme.current.dark ? "brightness(0) invert(1)" : undefined };
    },
    /**
     * Search icons by inserted name
     * @param q name of the icon
     * @return list of icons
     */
    search(q: string) {
      // clear icons if the query is smaller than 3 chars
      if (q.length < 3) {
        return new Promise<void>((res) => {
          this.icons = [];
          res();
        });
      }

      return api
        .fetch(`/icons?q=${q}`, "GET")
        .then(
          (icons) => (this.icons = icons.map((icon: any) => ({ term: icon.term, id: icon.id }))),
        );
    },
    onSelected(icon: Icon) {
      this.iconObject = icon;
    },
    /**
     * Creates rules for device according to ShowEvent_errorWarningState field,
     * save ids of created rules in current device object
     * @param deviceData current device data object
     */
    async addRulesWhenCreateDevice(deviceData: any) {
      if (
        !deviceData.data.mappings.ShowEvent_errorWarningState ||
        !deviceData.data.mappings.ShowEvent_errorWarningState.length
      )
        return;
      const rulesList: any = [
        {
          id: "",
          name: `${deviceData.name} Warning Rule`,
          active: true,
          timeout: 1,
          conditions: [
            {
              variable: deviceData.data.mappings.ShowEvent_errorWarningState,
              and_or: false,
              condition: "equals",
              target: 1,
            },
          ],
          actions: [
            { type: "alert", params: { type: 1, body: "{{rule}} - Device has a Warning" } },
          ],
          created_at: "",
        },
        {
          id: "",
          name: `${deviceData.name} Error Rule`,
          active: true,
          timeout: 1,
          conditions: [
            {
              variable: deviceData.data.mappings.ShowEvent_errorWarningState,
              and_or: false,
              condition: "equals",
              target: 2,
            },
          ],
          actions: [{ type: "alert", params: { type: 2, body: "{{rule}} - Device has an Error" } }],
          created_at: "",
        },
      ];
      const res = await this.addRules({
        project_id: this.project.id,
        rulesList,
      });
      deviceData.data.meta.warningRule = res[0].id;
      deviceData.data.meta.errorRule = res[1].id;
    },

    /**
     * Replacing existing rules with new ones when ShowEvent_errorWarningState field is changed
     * @param deviceData current device data object
     */
    async addRulesWhenEditDevice(deviceData: any) {
      const oldErrorWarningVar = this.deviceData.data.mappings.ShowEvent_errorWarningState;
      const newErrorWarningVar = deviceData.data.mappings.ShowEvent_errorWarningState;
      // if errorWarning was changed
      if (oldErrorWarningVar && !newErrorWarningVar) {
        await Promise.all([
          this.deleteRule({
            project_id: this.project.id,
            rule_id: deviceData.data.meta.warningRule,
          }),
          this.deleteRule({
            project_id: this.project.id,
            rule_id: deviceData.data.meta.errorRule,
          }),
        ]);
      }
      if (oldErrorWarningVar !== newErrorWarningVar && newErrorWarningVar) {
        // delete old rules
        if (oldErrorWarningVar) {
          await Promise.all([
            this.deleteRule({
              project_id: this.project.id,
              rule_id: deviceData.data.meta.warningRule,
            }),
            this.deleteRule({
              project_id: this.project.id,
              rule_id: deviceData.data.meta.errorRule,
            }),
          ]);
        }
        const rulesList: any = [
          {
            id: "",
            name: `${deviceData.name} Warning Rule`,
            active: true,
            timeout: 1,
            conditions: [
              {
                variable: deviceData.data.mappings.ShowEvent_errorWarningState,
                and_or: false,
                condition: "equals",
                target: 1,
              },
            ],
            actions: [
              { type: "alert", params: { type: 1, body: "{{rule}} - Device has a Warning" } },
            ],
            created_at: "",
          },
          {
            id: "",
            name: `${deviceData.name} Error Rule`,
            active: true,
            timeout: 1,
            conditions: [
              {
                variable: deviceData.data.mappings.ShowEvent_errorWarningState,
                and_or: false,
                condition: "equals",
                target: 2,
              },
            ],
            actions: [
              { type: "alert", params: { type: 2, body: "{{rule}} - Device has an Error" } },
            ],
            created_at: "",
          },
        ];
        // create new rules
        const res: any = await this.addRules({
          project_id: this.project.id,
          rulesList,
        });
        const getWarningRule = () => {
          const warningRuleObj: any = res.find(
            (rule: any) => rule.name === `${deviceData.name} Warning Rule`,
          );
          return warningRuleObj.id;
        };
        const getErrorRule = () => {
          const errorRuleObj: any = res.find(
            (rule: any) => rule.name === `${deviceData.name} Error Rule`,
          );
          return errorRuleObj.id;
        };
        deviceData.data.meta.warningRule = getWarningRule();
        deviceData.data.meta.errorRule = getErrorRule();
      }
    },
    /**
     * Goes through device mappings list and create options for every item
     * @return form of mappings options
     */
    initMappingsForDevice() {
      let mappingsSchema: any = {};
      Object.keys(this.devicesTypes[this.deviceData.data.type].mappings).forEach((item: string) => {
        const defaultVariable = (defaultMappings as any)[this.deviceData.data.type]?.[item] ?? "";
        mappingsSchema = { ...mappingsSchema, [item]: defaultVariable };
      });
      return mappingsSchema;
    },
    onStageChange(val: number) {
      if (val === 2) {
        this.fetchMeasurements(this.$route.params.id as string);
      }
    },
    fetchMeasurements(projectId: string): Promise<void> {
      return this.$store.dispatch("measurements/fetchMeasurements", projectId);
    },
    addRules(payload: AddRulesPayload): Promise<Promise<any>> {
      return this.$store.dispatch("rules/addRules", payload);
    },
    deleteRule(payload: DeleteRulePayload): Promise<Promise<void>> {
      return this.$store.dispatch("rules/deleteRule", payload);
    },
  },
});
