<template>
  <div>
    <CoreDataTable
      v-model:page="currentPage"
      :headers="headers"
      :items="filteredBySearch"
      :items-per-page="itemsPerPage"
      class="elevation-0"
      hide-default-footer
    >
      <template #bottom />
      <template #item.actions="{ item }">
        <slot :item="item" name="actions" />
      </template>

      <template v-if="$vuetify.display.mobile" #headers />
      <template v-if="$vuetify.display.mobile" #body="{ items }">
        <tr v-for="(item, index) in items" :key="index" class="v-data-table__mobile-table-row">
          <td class="v-data-table__mobile-row">
            <div class="v-data-table__mobile-row__header">
              {{ $t("uiComponents.workbenchTable.name") }}
            </div>
            <div class="v-data-table__mobile-row__cell">
              {{ item.name }}
            </div>
          </td>
          <td class="v-data-table__mobile-row">
            <div class="v-data-table__mobile-row__header">
              {{ $t("uiComponents.workbenchTable.type") }}
            </div>
            <div class="v-data-table__mobile-row__cell">
              {{ item.data?.type }}
            </div>
          </td>
          <td class="v-data-table__mobile-row">
            <div class="v-data-table__mobile-row__header">
              {{ $t("uiComponents.workbenchTable.area") }}
            </div>
            <div class="v-data-table__mobile-row__cell">
              {{ deviceRoomName(item.collection_id) }}
            </div>
          </td>
          <td class="v-data-table__mobile-row">
            <div class="v-data-table__mobile-row__header">
              {{ $t("uiComponents.workbenchTable.actions") }}
            </div>
            <div class="v-data-table__mobile-row__cell">
              <slot :item="item" name="actions" />
            </div>
          </td>
        </tr>
      </template>
    </CoreDataTable>
    <div style="max-width: 600px; margin: auto">
      <CorePagination v-model="currentPage" :length="pageNumber" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

import { RootState } from "@/store/types";
import { calculatePageCount } from "@/utils/utilsFunctions";

export default defineComponent({
  data() {
    return {
      currentPage: 1,
    };
  },
  computed: {
    devicesState() {
      return (this.$store.state as RootState).devices;
    },
    headers(): any {
      return [
        { key: "name", title: this.$t("uiComponents.workbenchTable.name"), align: "start" },
        { key: "data.type", title: this.$t("uiComponents.workbenchTable.type") },
        { key: "area", title: this.$t("uiComponents.workbenchTable.area") },
        { key: "actions", title: this.$t("uiComponents.workbenchTable.actions"), sortable: false },
      ];
    },
    pageNumber() {
      return calculatePageCount(this.filteredBySearch.length, this.itemsPerPage);
    },
    computedItems() {
      return this.items.map((i: any) => ({ ...i, area: this.deviceRoomName(i.collection_id) }));
    },
    /**
     * Filters the existing list of devices by type, name, area affiliation
     * @return filtered devices
     */
    filteredBySearch() {
      return this.computedItems.filter((device: any) => {
        if (!this.devicesFilter) return true;
        return [device.name, this.deviceRoomName(device.collection_id), device.data?.type]
          .map((i) => i.toLowerCase())
          .includes(this.devicesFilter.toLowerCase());
      });
    },
    devicesFilter() {
      return this.devicesState.devicesFilter;
    },
    rooms(): any {
      return this.$store.getters["rooms/rooms"];
    },
  },
  methods: {
    /**
     * Defines the name of the room to which the device belongs
     * @param roomId id of the room
     * @return room name if room has named or empty string
     */
    deviceRoomName(roomId: any) {
      if (this.rooms.length) {
        const room: any = this.rooms.find((room: any) => room.id === roomId);
        return room?.name || null;
      }
      return "";
    },
  },
  props: {
    items: { type: Array<any>, default: [] },
    itemsPerPage: { default: 100, type: Number },
  },
});
</script>
