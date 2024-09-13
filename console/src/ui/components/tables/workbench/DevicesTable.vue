<template>
  <BaseWorkbenchTable :items="filterByDevices" :items-per-page="props.itemsPerPage">
    <template #actions="{ item }">
      <div class="d-flex">
        <ManageDevice
          :device-data="item"
          :form-title="$t('modals.manageDevice.editDeviceTitle')"
          @handle-control="editControl"
        >
          <CoreButton button-type="standardIcon" icon-name="settings" />
        </ManageDevice>

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

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

import DeleteModalForm from "@/ui/components/modals/DeleteModalForm.vue";
import ManageDevice from "@/ui/components/modals/ManageDevice/ManageDevice.vue";
import BaseWorkbenchTable from "@/ui/components/tables/workbench/BaseWorkbenchTable.vue";

/**
 * Component that shows table of devices
 */

const store = useStore();

const filterByDevices = computed(() => {
  const devicesTypes = Object.keys(store.getters["devices/devicesTypes"]);
  return store.getters["devices/devices"].filter((device: any) =>
    devicesTypes.includes(device.data.type),
  );
});

function editControl(payload: any) {
  store.dispatch("devices/updateDevice", payload);
}
function deleteControlHandle(control: any) {
  store.dispatch("devices/deleteDevice", control);
}

const props = withDefaults(
  defineProps<{
    itemsPerPage: number;
  }>(),
  { itemsPerPage: 100 },
);
</script>
