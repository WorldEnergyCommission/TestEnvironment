<template>
  <div v-if="!loadingProps">
    <CoreRow dense>
      <CoreColumn cols="12">
        <CoreTextField
          v-model="name"
          :label="$t('modals.manageDevice.form.name')"
          hide-details
          max-length="30"
        />
      </CoreColumn>
      <CoreDivider class="my-3" />
      <CoreColumn cols="12">
        <b> Devices </b>
      </CoreColumn>
      <CoreColumn v-for="(item, index) in properties" :key="index" cols="12">
        <div>
          <div class="optional">
            <div v-if="item.optional">Optional</div>
          </div>
          <DataMappingSelectField
            v-model="mappings[item.id]"
            :optional="item.optional"
            :type-id="item.device_type_id"
            hide-details
            :max-count="item.max_count"
          />
          <div class="description">
            {{ item.name }}
          </div>
        </div>
      </CoreColumn>
    </CoreRow>
    <CoreRow>
      <CoreColumn>
        <FinalStepActions
          :disable-next-button="false"
          :next-button-tool-tip="$t('modals.manageDevice.tooltips.areaFields')"
          :hide-next-tool-tip="false"
          :with-spacer="true"
          style="width: 100%"
          :loading="loadingCreate"
          :with-back="!editExistingDevice"
          @back="$emit('back')"
          @next="saveModule"
        />
      </CoreColumn>
    </CoreRow>
  </div>
  <CircleSpinner v-else />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import DataMappingSelectField from "./DataMappingSelectField.vue";
import api from "@/store/api";
import { ModuleType, ModuleProperty } from "@/store/modules/modules/types";
import { RootState } from "@/store/types";
import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import { FinalStepActions } from "@/ui/components/modals/components/Actions";

export default defineComponent({
  components: {
    DataMappingSelectField,
    FinalStepActions,
    CircleSpinner,
  },
  data() {
    const mappings = {} as Record<string, ModuleProperty | ModuleProperty[]>;

    return {
      /**
       * contains the mappings of this module in form of an object
       * every key is the property id
       * every value is either a single device mapping or an array of mappings
       */
      mappings,
      name: "",
      loadingProps: true,
      loadingCreate: false,
      properties: [],
    };
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    projectsState() {
      return (this.$store.state as RootState).projects;
    },
    typeValidation() {
      return true;
    },
    /**
     * Get all keys of measurements from store
     * */
    measurementsKeysList() {
      return this.measurementsState.measurementsKeys;
    },
    /**
     * Convert mappings object to nested array
     * every entry is either a single module mapping or
     * an array of mappings
     */
    nestedPropertiesArray() {
      return Object.entries(this.mappings).map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((item) => ({
            id: key,
            data_mapping_id: item.data_mapping_id,
          }));
        }
        return { id: key, data_mapping_id: value.data_mapping_id };
      });
    },
    /**
     * flatten mapings to a single array
     * containing all properites for this modules
     * used in call to api when creating or updating module
     */
    propertiesArray() {
      return this.nestedPropertiesArray.reduce(
        (flatArray: { id: string; device_id: string }[], item) => {
          if (Array.isArray(item)) {
            flatArray.push(...item);
          } else {
            flatArray.push(item);
          }
          return flatArray;
        },
        [],
      );
    },
  },
  /**
   * dispach measurments & agg devices fetch on creation to show
   * current values in selects
   */
  created() {
    this.$store.dispatch("measurements/fetchMeasurements", this.projectsState.projectId!);
    this.$store.dispatch("dataMappings/fetchDataMappings");
    this.setState();
  },
  methods: {
    /**
     * Save module to db via api
     * uses either PUT or POST depending if this is an existing device (boolean prop)
     */
    async saveModule() {
      try {
        this.loadingCreate = true;
        const body = {
          type_id: this.type.id,
          name: this.name,
          properties: this.propertiesArray,
        };

        // select method & url depending on if this is a form for new or existing device
        const method = this.editExistingDevice ? "PUT" : "POST";
        const url = this.editExistingDevice
          ? `/projects/${this.projectsState.projectId}/modules/${this.currentID}`
          : `/projects/${this.projectsState.projectId}/modules`;

        const response = await api.fetch(url, method, body);
        this.$emit("finished", response.data);
      } catch (e: any) {
        this.setReport({
          type: "error",
          message: e?.message,
          value: true,
        });
      } finally {
        this.loadingCreate = false;
      }
    },
    /**
     * fetch the properties this type of module has to create form
     */
    async fetchMappingProperties() {
      if (!this.type.id || this.type.id === "") return;
      try {
        this.loadingProps = true;
        const response = await api.fetch(`/modules/types/${this.type.id}/properties`, "GET");
        this.properties = response;
      } catch (e: any) {
        this.setReport({
          type: "error",
          message: e?.message,
          value: true,
        });
      } finally {
        this.loadingProps = false;
      }
    },
    setReport(payload: any) {
      this.$store.commit("app/setReport", payload);
    },
    /**
     * If Form is used for editing, set the already existing mappings in state
     * Needs to be done via watcher, since api send single array of properties
     * converts the array to an object, with the property id as key and
     * the mapping as value
     */
    setState() {
      if (this.currentName) {
        this.name = this.currentName;
      }
      if (this.currentMappings) {
        this.currentMappings.forEach((item) => {
          if (this.mappings[item.id] === undefined) {
            this.mappings[item.id] = [
              {
                name: item.name,
                data_mapping_id: item.data_mapping_id,
                data_mapping_name: item.data_mapping_name,
              },
            ];
          } else {
            this.mappings[item.id] = [
              {
                name: item.name,
                data_mapping_id: item.data_mapping_id,
                data_mapping_name: item.data_mapping_name,
              },
              ...this.mappings[item.id],
            ];
          }
        });
      }
    },
  },
  props: {
    type: { default: () => ({}), type: Object as PropType<ModuleType> },
    // properties to edit an existng agggregation device
    editExistingDevice: { default: false, type: Boolean },
    currentID: {
      type: String,
    },
    currentName: {
      type: String,
    },
    currentMappings: {
      type: Array<any>,
    },
  },
  watch: {
    type: [{ immediate: true, handler: "fetchMappingProperties" }],
    currentMappings: [{ handler: "setState" }],
    currentName: [{ handler: "setState" }],
  },
});
</script>
