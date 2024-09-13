<template>
  <CoreMenu v-model="isMenuOpen" location="bottom start">
    <template #activator="{ props }">
      <CoreButton
        :class="{ 'icon-animation-validation': settingsValidation }"
        button-type="standardIcon"
        v-bind="props"
      >
        <CoreIcon>fas fa-ellipsis-v</CoreIcon>
      </CoreButton>
    </template>

    <CoreList class="device-actions">
      <template v-for="(item, index) in items">
        <CoreListItem v-if="item.visible && isMenuOpen" :key="index" link>
          <!-- render manage modal form according to device type -->
          <template v-if="item.modal">
            <component
              :is="item.modal"
              :deleted-item-name="item.deleteText"
              :device-data="device"
              :form-title="item.formTitle ? $t(item.formTitle) : ''"
              :model="device"
              color="accent"
              @delete-handler="removeDevice"
              @handle-control="
                (payload) => {
                  isMenuOpen = false;
                  item.handle(payload);
                }
              "
              @close="() => (isMenuOpen = false)"
            >
              <div class="device-actions-item">
                {{ $t(item.locale) }}
              </div>
            </component>
          </template>
          <!-- id item modal = false, render usual list item -->
          <template v-if="!item.modal">
            <div
              :class="[
                'device-actions-item',
                { 'device-actions-item-error': item.isValidation && settingsValidation },
              ]"
              @click="item.handle"
            >
              {{ $t(item.locale) }}
            </div>
          </template>
        </CoreListItem>
      </template>
    </CoreList>
  </CoreMenu>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

import { IDevicesTypes, IDeviceType } from "@/store/modules/devices/types";
import { IMLModelType, IMLModelTypes } from "@/store/modules/mpc/types";
import { RootState } from "@/store/types";

/**
 * Component that represent devices actions list
 */
export default defineComponent({
  components: {
    ManageMLModel: defineAsyncComponent(
      () => import("@/ui/components/modals/ManageMLModel/ManageMLModel.vue"),
    ),
    ManageDevice: defineAsyncComponent(
      () => import("@/ui/components/modals/ManageDevice/ManageDevice.vue"),
    ),
    DeleteModalForm: defineAsyncComponent(
      () => import("@/ui/components/modals/DeleteModalForm.vue"),
    ),
    ManageAnomalyDetection: defineAsyncComponent(
      () => import("@/ui/components/modals/ManageAnomalyDetection/ManageAnomalyDetection.vue"),
    ),
    ManageCharts: defineAsyncComponent(() => import("@/ui/components/modals/ManageChartsNew.vue")),
  },
  props: ["device"],
  emits: ["switchSettingsView", "favoriteUpdate", "chartChange", "rerenderDevice"],
  data() {
    return {
      isMenuOpen: false,
    };
  },
  computed: {
    anomalyDetectionState() {
      return (this.$store.state as RootState).anomalyDetection;
    },
    chartsState() {
      return (this.$store.state as RootState).charts;
    },
    membersState() {
      return (this.$store.state as RootState).members;
    },
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    measurements() {
      return this.measurementsState.measurements;
    },
    /**
     * Used different actions list according to device favorite status
     * @return {array} list of actions
     */
    items() {
      if (
        !this.hasCurrentMemberScopedPermission("writeDevice", this.device.id) &&
        !this.hasCurrentMemberScopedPermission("writeAI", this.device.id) &&
        !this.hasCurrentMemberScopedPermission("deleteDevice", this.device.id) &&
        !this.hasCurrentMemberScopedPermission("deleteAI", this.device.id)
      ) {
        return [];
      }

      let items: any[] = [];

      if (
        this.hasCurrentMemberScopedPermission("writeDevice", this.device.id) ||
        this.hasCurrentMemberScopedPermission("writeAI", this.device.id)
      ) {
        items = [
          ...items,
          !this.device.favorite
            ? this.actionsSchemasList.addToFavorites
            : this.actionsSchemasList.deleteFromFavorites,
        ];

        items = [...items, this.actionsSchemasList.settings, this.actionsSchemasList.edit];
      }

      if (
        this.hasCurrentMemberScopedPermission("deleteDevice", this.device.id) ||
        this.hasCurrentMemberScopedPermission("deleteAI", this.device.id)
      ) {
        items = [...items, this.actionsSchemasList.delete];
      }

      return items;
    },
    currentMember() {
      return this.membersState.currentMember;
    },
    /**
     * Schemas for all possible device actions
     * @return {object} collection of actions
     */
    actionsSchemasList() {
      return {
        addToFavorites: {
          title: "Add to favorites",
          locale: "uiComponents.deviceActions.addToFavorites",
          handle: this.addToFavorites,
          visible: true,
        },
        deleteFromFavorites: {
          title: "Delete from favorites",
          locale: "uiComponents.deviceActions.deleteFromFavorites",
          handle: this.deleteFromFavorites,
          visible: true,
        },
        settings: {
          title: "Settings",
          locale: "uiComponents.deviceActions.settings",
          handle: () => this.$emit("switchSettingsView", true),
          visible: this.settingsListView,
          isValidation: true,
        },
        edit: {
          title: "Edit",
          locale: "uiComponents.deviceActions.edit",
          handle: this.editControl,
          modal: this.manageModalType,
          formTitle: this.editFormTitle,
          visible: true,
        },
        delete: {
          title: "Delete",
          locale: "uiComponents.deviceActions.delete",
          handle: this.removeDevice,
          modal: "DeleteModalForm",
          deleteText: this.device.name,
          visible: true,
        },
      };
    },
    isDevice() {
      return Object.keys(this.devicesTypes).some((item) => item === this.device.data.type);
    },
    isChart() {
      return Object.keys(this.chartsState.chartsTypes).some(
        (item) => item === this.device.data.type,
      );
    },
    mlModel() {
      return Object.keys(this.mlModelTypes).some((item) => item === this.device.data.type);
    },
    isAnomalyDetection() {
      return Object.keys(this.anomalyDetectionState.anomalyDetectionTypes).some(
        (item) => item === this.device.data.type,
      );
    },
    isMPC() {
      const mpcApiTypes: string[] = [
        ...Object.keys(this.mlModelTypes),
        ...Object.keys(this.anomalyDetectionState.anomalyDetectionTypes),
      ];
      return mpcApiTypes.some((type: string) => type === this.device.data.type);
    },
    /**
     * Define modal window by device type
     * @return {string} name of manage modal
     */
    manageModalType() {
      if (this.isDevice) return "ManageDevice";
      if (this.isChart) return "ManageCharts";
      if (this.mlModel) return "ManageMLModel";
      return "ManageAnomalyDetection";
    },
    /**
     * Define translation path for title edit modal form
     * @return {string} path to i18n translation
     */
    editFormTitle() {
      if (this.isDevice) return "modals.manageDevice.editDeviceTitle";
      if (this.isChart) return "modals.manageCharts.editChartTitle";
      if (this.mlModel) return "modals.manageMLModel.editDeviceTitle";
      return "modals.manageAnomalyDetection.editAnomalyDetectionTitle";
    },
    /**
     * This getter check if current device has settings view
     * @return {boolean} is device has settings view
     */
    settingsListView() {
      if (this.isChart) return false;
      if (this.isAnomalyDetection) return false;
      if (this.mlModel) return this.mlModelTypeSchemaByKey(this.device.data.type).isSettingsView;
      return this.devicesTypes[this.device.data.type].isSettingsView;
    },
    /**
     * Validation for devices action list.
     * If some form field in device settings view not valid,
     * red frame around the settings list item flashes
     * @return {boolean} validation status
     */
    devicesValidation() {
      const additionalBasicDevices: any =
        this.device.data?.meta?.deviceSchema?.additionalBasicDevices;
      if (!additionalBasicDevices?.length) return null;
      const inputFieldsArray = () => {
        const filtered: any = additionalBasicDevices.filter((field: string) => {
          const fieldWithoutNumbers: any = field.replace(/[0-9]/g, "");
          return fieldWithoutNumbers === "InputField";
        });
        return filtered.length ? filtered.map((field: string) => `${field}_targetValue`) : null;
      };
      const isValid: any = !inputFieldsArray()
        ? []
        : inputFieldsArray().map((field: string) => {
            const { minMaxBorders } = this.deviceTypeSchemaByKey(this.device.data.type).mappings[
              field
            ];
            const value: any = this.measurements.get(this.device.data.mappings[field]);
            if (!minMaxBorders) return [];
            return (
              minMaxBorders.min > value || minMaxBorders.max < value || typeof value !== "number"
            );
          });

      return isValid.some((el: boolean) => el);
    },
    /**
     * Validation for MPC devices action list.
     * If some form field in MPC device settings view not valid,
     * red frame around the settings list item flashes
     * @return {boolean} validation status
     */
    mpcValidation() {
      const currentMPCTypeSchema: any = this.mlModelTypeSchemaByKey(this.device.data.type);
      const { settingsMappings } = currentMPCTypeSchema;
      if (!this.device.data?.meta?.controllerMappings || !settingsMappings) return null;

      const isValid: any = settingsMappings.map((field: string) => {
        const isFieldAreObject: boolean =
          typeof this.device.data.meta.controllerMappings[field] === "object";
        const isDynamicField: boolean = /#id#/.test(field);
        if (isDynamicField) {
          const deviceIdUnderline: string = this.device.id.replace(/-/g, "_");
          const fieldVariable: string = field.replace(/#id#/, deviceIdUnderline);
          const value: any = this.measurements.get(fieldVariable);
          const { min, max } = currentMPCTypeSchema.dynamicMappingsMinMax[field];
          return min > value || max < value || typeof value !== "number";
        } else if (isFieldAreObject) {
          const { minMaxBorders } = currentMPCTypeSchema.controllerMappings[field];
          const fields = this.device.data.meta.controllerMappings[field];
          // TODO: Necesary because field adaptive self consuption can be null
          if (fields === null) {
            return true;
          }
          const valuesArray = Object.values(fields).map((val: any) => this.measurements.get(val));
          return valuesArray.some(
            (value: any) =>
              minMaxBorders.min > value || minMaxBorders.max < value || typeof value !== "number",
          );
        } else {
          const { minMaxBorders } = currentMPCTypeSchema.controllerMappings[field];
          const value: any = this.measurements.get(this.device.data.meta.controllerMappings[field]);
          return (
            (minMaxBorders && minMaxBorders.min > value) ||
            (minMaxBorders && minMaxBorders.max < value) ||
            typeof value !== "number"
          );
        }
      });

      return isValid.some((el: boolean) => el);
    },
    /**
     * The flashing frame is only visible on devices that have settings view
     * @return validation getter
     */
    settingsValidation() {
      if (this.isDevice) return this.devicesValidation;
      if (this.mlModel) return this.mpcValidation;
      return null;
    },
    devicesTypes(): IDevicesTypes {
      return this.$store.getters["devices/devicesTypes"];
    },
    deviceTypeSchemaByKey(): (key: string) => IDeviceType {
      return this.$store.getters["devices/deviceTypeSchemaByKey"];
    },
    mlModelTypes(): IMLModelTypes {
      return this.$store.getters["mpc/mlModelTypes"];
    },
    mlModelTypeSchemaByKey(): (key: string) => IMLModelType {
      return this.$store.getters["mpc/mlModelTypeSchemaByKey"];
    },
    hasCurrentMemberScopedPermission(): (permission: string, scope: string) => boolean {
      return this.$store.getters["members/hasScopedPermission"];
    },
  },
  methods: {
    /**
     * Checks device type and use deleteFromFavorites method according to it
     */
    deleteFromFavorites() {
      if (this.isMPC) {
        this.removeMPCFromFavorites(this.device.id);
      } else {
        this.$emit("favoriteUpdate", this.device);
        this.removeDeviceFromFavorites(this.device.id);
      }
    },
    /**
     * Checks device type and use addToFavorites method according to it
     */
    addToFavorites() {
      if (this.isMPC) {
        this.addMPCToFavorites(this.device.id);
      } else {
        this.$emit("favoriteUpdate", this.device);
        this.addDeviceToFavorites(this.device.id);
      }
    },
    /**
     * Checks device type and use delete method according to it
     */
    removeDevice() {
      if (this.isMPC) {
        this.deleteMPC(this.device);
      } else {
        this.deleteDevice(this.device);
      }
    },
    /**
     * Checks device type and use update method according to it
     * @param payload device or mpc data
     */
    async editControl(payload: any) {
      if (this.isMPC) {
        await this.updateMPC(payload);
      } else {
        await this.updateDevice(payload);
      }

      this.$emit("chartChange", payload);
      this.$emit("rerenderDevice", payload);
    },
    deleteDevice(device: any): Promise<void> {
      return this.$store.dispatch("devices/deleteDevice", device);
    },
    updateDevice(device: any): Promise<void> {
      return this.$store.dispatch("devices/updateDevice", device);
    },
    addDeviceToFavorites(deviceId: string): Promise<void> {
      return this.$store.dispatch("devices/addDeviceToFavorites", deviceId);
    },
    removeDeviceFromFavorites(deviceId: string): Promise<void> {
      return this.$store.dispatch("devices/removeDeviceFromFavorites", deviceId);
    },
    addMPCToFavorites(mpcId: any): Promise<void> {
      return this.$store.dispatch("mpc/addMPCToFavorites", mpcId);
    },
    removeMPCFromFavorites(mpcId: any): Promise<void> {
      return this.$store.dispatch("mpc/removeMPCFromFavorites", mpcId);
    },
    deleteMPC(mpcId: any): Promise<void> {
      return this.$store.dispatch("mpc/deleteMPC", mpcId);
    },
    updateMPC(mpc: any): Promise<any> {
      return this.$store.dispatch("mpc/updateMPC", mpc);
    },
  },
});
</script>

<style lang="scss" scoped>
@import "./src/ui/components/devices/layout/CommonDeviceLayoutStyling";

@keyframes blinkIcon {
  0% {
    color: rgb(var(--v-theme-lynusText));
  }
  25% {
    color: rgb(var(--v-theme-error));
  }
  75% {
    color: rgb(var(--v-theme-error));
  }
  100% {
    color: rgb(var(--v-theme-lynusText));
  }
}

@keyframes blinkMenuItem {
  0% {
    border: 1px solid rgb(var(--v-theme-surface));
  }
  25% {
    border: 1px solid rgb(var(--v-theme-error));
  }
  75% {
    border: 1px solid rgb(var(--v-theme-error));
  }
  100% {
    border: 1px solid rgb(var(--v-theme-surface));
  }
}

.device-actions {
  @extend .common-device-actions;
  .v-list-item {
    .custom-icon {
      width: 100%;
    }

    & > span {
      display: block;
      width: 100%;
    }

    .device-actions-item-error {
      animation: blinkMenuItem 2s linear infinite;
    }

    .device-actions-item {
      @extend .common-device-actions-item;
    }
  }

  .icon-animation-validation {
    animation: blinkIcon 2s linear infinite;
  }
}
</style>
