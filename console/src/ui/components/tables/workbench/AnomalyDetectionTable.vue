<template>
  <BaseWorkbenchTable :items="anomalyDetectionDevices" :items-per-page="itemsPerPage">
    <template #actions="{ item }">
      <div class="d-flex align-center">
        <ManageAnomalyDetection
          :device-data="item"
          :form-title="$t('modals.manageAnomalyDetection.editAnomalyDetectionTitle')"
          @handle-control="editControl"
        >
          <CoreButton button-type="standardIcon" icon-name="settings" />
        </ManageAnomalyDetection>
        <DeleteModalForm
          :deleted-item-name="item.name"
          color="accent"
          @delete-handler="deleteControlHandle(item)"
        >
          <CoreButton button-type="standardIcon" icon-name="trash" />
        </DeleteModalForm>
      </div>
    </template>
  </BaseWorkbenchTable>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { RootState } from "@/store/types";
import DeleteModalForm from "@/ui/components/modals/DeleteModalForm.vue";
import ManageAnomalyDetection from "@/ui/components/modals/ManageAnomalyDetection/ManageAnomalyDetection.vue";
import BaseWorkbenchTable from "@/ui/components/tables/workbench/BaseWorkbenchTable.vue";

/**
 * Component that shows table of Anomaly Detection devices
 */
export default defineComponent({
  components: {
    DeleteModalForm,
    ManageAnomalyDetection,
    BaseWorkbenchTable,
  },
  props: {
    itemsPerPage: { default: 100, type: Number },
  },
  computed: {
    devicesState() {
      return (this.$store.state as RootState).devices;
    },
    anomalyDetectionDevices(): any {
      return this.$store.getters["anomalyDetection/anomalyDetectionDevices"];
    },
  },
  methods: {
    editControl(payload: any) {
      this.updateMPC(payload);
    },
    deleteControlHandle(control: any) {
      this.deleteMPC(control);
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
