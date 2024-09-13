<template>
  <BaseWorkbenchTable :items="chartsList" :items-per-page="itemsPerPage">
    <template #actions="{ item }">
      <div class="d-flex align-center">
        <ManageCharts :model="item" form-title="modals.manageCharts.editChartTitle" @handle-control="editControl">
          <CoreButton button-type="standardIcon" icon-name="settings" />
        </ManageCharts>
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
import ManageCharts from "@/ui/components/modals/ManageChartsNew.vue";
import BaseWorkbenchTable from "@/ui/components/tables/workbench/BaseWorkbenchTable.vue";

/**
 * Component that shows table of charts
 */
export default defineComponent({
  components: {
    DeleteModalForm,
    ManageCharts,
    BaseWorkbenchTable,
  },
  props: {
    itemsPerPage: { default: 100, type: Number },
  },
  computed: {
    devicesState() {
      return (this.$store.state as RootState).devices;
    },
    chartsList(): any {
      return this.$store.getters["charts/charts"];
    },
  },
  methods: {
    editControl(payload: any) {
      this.updateDevice(payload);
    },
    deleteControlHandle(control: any) {
      this.deleteDevice(control);
    },
    updateDevice(control: any): Promise<void> {
      return this.$store.dispatch("devices/updateDevice", control);
    },
    deleteDevice(control: any): Promise<void> {
      return this.$store.dispatch("devices/deleteDevice", control);
    },
  },
});
</script>
