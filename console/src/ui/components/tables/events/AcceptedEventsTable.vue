<template>
  <div v-if="acceptedList.length !== 0">
    <CoreDataTable :headers="headers as any" :items="acceptedList" :items-per-page="itemsPerPage">
      <template #bottom />

      <template #column.accepted="{ column }">
        <span v-if="column.title !== 'Accept'" class="pr-4">{{ column.title }}</span>
        <span v-if="column.title === 'Accept'" class="pr-4">Accepted At</span>
      </template>

      <template #item.type="{ internalItem: item }">
        {{ typeFromNumberCode(item.columns.type) }}
      </template>

      <template #item.created_at="{ internalItem }">
        {{ formatDate(internalItem.columns.created_at) }}
      </template>

      <template #item.accepted_at="{ internalItem }">
        {{ formatDate(internalItem.columns.accepted_at) }}
      </template>

      <template #item.accepted_by="{ internalItem }">
        {{ getAcceptedByMember(internalItem.columns.accepted_by) }}
      </template>

      <!-- mobile version of accepted events table -->
      <template v-if="$vuetify.display.mobile" #headers />
      <template v-if="$vuetify.display.mobile" #body="{ items }">
        <tbody>
          <tr v-for="(item, key) in items" :key="key" class="v-data-table__mobile-table-row">
            <td class="v-data-table__mobile-row">
              <div class="v-data-table__mobile-row__header">Type</div>
              <div class="v-data-table__mobile-row__cell">
                {{ typeFromNumberCode(item.type) }}
              </div>
            </td>
            <td class="v-data-table__mobile-row">
              <div class="v-data-table__mobile-row__header">Text</div>
              <div class="v-data-table__mobile-row__cell pl-5">
                {{ item.body }}
              </div>
            </td>
            <td class="v-data-table__mobile-row">
              <div class="v-data-table__mobile-row__header">Created Date</div>
              <div class="v-data-table__mobile-row__cell">
                {{ formatDate(item.created_at) }}
              </div>
            </td>
            <td class="v-data-table__mobile-row">
              <div class="v-data-table__mobile-row__header">Accepted Date</div>
              <div class="v-data-table__mobile-row__cell">
                {{ formatDate(item.accepted_at) }}
              </div>
            </td>
            <td class="v-data-table__mobile-row">
              <div class="v-data-table__mobile-row__header">Accepted by</div>
              <div class="v-data-table__mobile-row__cell">
                {{ getAcceptedByMember(item.accepted_by) }}
              </div>
            </td>
          </tr>
        </tbody>
      </template>
    </CoreDataTable>
    <div :style="`max-width:${$vuetify.display.mobile ? '90' : '75'}%; margin-inline: auto;`">
      <CorePagination
        :model-value="modelValue"
        :length="pageCount"
        @update:model-value="(page: number) => $emit('pageSwap', page)"
      />
    </div>
  </div>
  <h2 v-else class="d-flex flex-column align-center mt-6">
    {{ $t("uiComponents.common.noDataFound") }}
  </h2>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { typeFromNumberCode } from "./EventUtils";
import { IUser } from "@/store/modules/app/types";
import { IMember } from "@/store/modules/members/types";
import { formatDate } from "@/utils/utilsFunctions";

export default defineComponent({
  props: {
    acceptedList: { default: () => [], type: Array as PropType<any[]> },
    itemsPerPage: { default: 0, type: Number },
    pageCount: { default: 1, type: Number },
    modelValue: {
      type: Number,
    },
  },
  data() {
    return {
      typeFromNumberCode: typeFromNumberCode,
      formatDate: formatDate,
    };
  },
  computed: {
    /**
     * Contains all headers for the EventTable
     */
    headers() {
      return [
        {
          title: this.$t("uiComponents.eventListTable.headers.type"),
          align: "start",
          width: "10%",
          sortable: false,
          key: "type",
        },
        {
          title: this.$t("uiComponents.eventListTable.headers.text"),
          align: "start",
          sortable: false,
          key: "body",
        },
        {
          title: this.$t("uiComponents.eventListTable.headers.date"),
          align: "start",
          width: "15%",
          sortable: false,
          key: "created_at",
        },
        {
          title: this.$t("uiComponents.eventListTable.headers.accept"),
          align: "start",
          width: "10%",
          sortable: false,
          key: "accepted_at",
        },
        {
          title: this.$t("uiComponents.eventListTable.headers.acceptedBy"),
          align: "start",
          width: "15%",
          sortable: false,
          key: "accepted_by",
        },
      ];
    },
    getIsAllAccepted(): any {
      return this.$store.getters["events/getIsAllAccepted"];
    },
    membersList(): IMember[] {
      return this.$store.getters["members/members"];
    },
    currentUser(): IUser {
      return this.$store.getters["app/getUser"];
    },
  },
  methods: {
    /**
     * Define member who accepted event
     * @param acceptedBy member id
     * @return full name of member
     */
    getAcceptedByMember(acceptedBy: string) {
      // get Username based on the given ID
      const user = this.membersList.find((member) => member.id === acceptedBy);
      if (user !== undefined) {
        const fullName = `${user.first_name} ${user.last_name}`;
        return fullName;
      }
      return "";
    },
  },
});
</script>
