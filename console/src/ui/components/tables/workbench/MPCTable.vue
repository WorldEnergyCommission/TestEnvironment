<template>
  <BaseWorkbenchTable :items="mlModelDevices" :items-per-page="itemsPerPage">
    <template #actions="{ item }">
      <div class="d-flex align-center">
        <template v-if="!loaders[item.id]">
          <ManageMLModel
            :device-data="item"
            :form-title="$t('modals.manageMLModel.editDeviceTitle')"
            @handle-control="editControl"
          >
            <CoreButton button-type="standardIcon" icon-name="settings" />
          </ManageMLModel>
          <DeleteModalForm
            :deleted-item-name="item.name"
            color="accent"
            @delete-handler="deleteControlHandle(item)"
          >
            <CoreButton button-type="standardIcon" icon-name="trash" />
          </DeleteModalForm>
        </template>
        <CoreTooltip v-else v-model="isTooltip" location="right">
          <template #activator="{}">
            <CoreButton button-type="standardIcon" loading />
          </template>
          <span>{{ $t("mlModel.EMS.deleteLoader") }}...</span>
        </CoreTooltip>
      </div>
    </template>
  </BaseWorkbenchTable>
</template>
<script lang="ts">
import { defineComponent } from "vue";

import { RootState } from "@/store/types";
import DeleteModalForm from "@/ui/components/modals/DeleteModalForm.vue";
import ManageMLModel from "@/ui/components/modals/ManageMLModel/ManageMLModel.vue";
import BaseWorkbenchTable from "@/ui/components/tables/workbench/BaseWorkbenchTable.vue";

/**
 * Component that shows table of ML Model devices
 */
export default defineComponent({
  components: {
    ManageMLModel,
    DeleteModalForm,
    BaseWorkbenchTable,
  },
  props: {
    itemsPerPage: { default: 100, type: Number },
  },
  data() {
    const loaders: any = {};

    return {
      isTooltip: true,
      loaders,
      currentPage: 1,
    };
  },
  computed: {
    devicesState() {
      return (this.$store.state as RootState).devices;
    },
    mlModelDevices(): any {
      return this.$store.getters["mpc/mlModelDevices"];
    },
  },
  watch: {
    loaders: [
      {
        handler: "onLoaders",
      },
    ],
  },
  beforeUnmount() {
    this.removeBlockedAlert();
  },
  methods: {
    blockedMessage(event: BeforeUnloadEvent) {
      event.returnValue = "Are you sure you want to leave?";
    },
    addBlockedAlert() {
      window.addEventListener("beforeunload", this.blockedMessage);
    },
    removeBlockedAlert() {
      window.removeEventListener("beforeunload", this.blockedMessage);
    },
    editControl(payload: any) {
      this.updateMPC(payload);
    },
    async deleteControlHandle(control: any) {
      this.loaders[control.id] = true;
      await this.deleteMPC(control);
      delete this.loaders[control.id];
    },
    /**
     * Triggers a message when attempting to leave the page during device removal
     * @param val object, list of loaders
     */
    onLoaders(val: any) {
      const count: number = Object.values(val).length;
      if (count) {
        this.addBlockedAlert();
      } else {
        this.removeBlockedAlert();
      }
    },
    updateMPC(mpc: any): Promise<Promise<void>> {
      return this.$store.dispatch("mpc/updateMPC", mpc);
    },
    deleteMPC(mpcId: any): Promise<Promise<void>> {
      return this.$store.dispatch("mpc/deleteMPC", mpcId);
    },
  },
});
</script>
