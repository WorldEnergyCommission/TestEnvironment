<template>
  <div class="w-100 h-100">
    <CoreColumn class="px-0" style="overflow: auto">
      <CoreSkeletonLoader :loading="!actualDevicesLoaded" type="heading, table-tbody">
        <!-- current workbench table -->
        <!-- itemsPerPage: number of elements in table -->
        <DevicesTable v-bind="{ itemsPerPage: itemCountPerPage }" class="w-100" />
      </CoreSkeletonLoader>
    </CoreColumn>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

import DevicesTable from "@/ui/components/tables/workbench/DevicesTable.vue";

const store = useStore();
const route = useRoute();

const itemCountPerPage = ref(100);

const actualDevicesLoaded = ref(false);

onMounted(async () => {
  // Load Rooms, Devices, MPC
  await store.dispatch("devices/fetchDevices", route.params.id as string);
  // turn of loader
  actualDevicesLoaded.value = true;
});
</script>
