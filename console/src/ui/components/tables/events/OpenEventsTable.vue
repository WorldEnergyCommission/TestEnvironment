<template>
  <div v-if="needtoAccept.length !== 0">
    <div>
      <span class="pr-4">{{ $t("uiComponents.eventListTable.acceptAll") }}</span>
      <CoreTooltip :location="$vuetify.display.mobile ? 'bottom' : 'top'">
        <template #activator="{ props }">
          <CoreButton
            button-type="standardIcon"
            v-bind="props"
            :disabled="!hasCurrentMemberPermission('writeAlert')"
            @click="$emit('acceptItem', null)"
          >
            <!-- sets the Color for the Icon in the Header of the Table -->
            <CoreIcon :color="!getIsAllAccepted ? '' : 'accent'"> fas fa-check </CoreIcon>
          </CoreButton>
        </template>
        <span v-if="getIsAllAccepted"> {{ $t("uiComponents.eventListTable.acceptAll") }} </span>
        <span v-if="!getIsAllAccepted">
          {{ $t("uiComponents.eventListTable.nothingToAccept") }}
        </span>
      </CoreTooltip>
    </div>

    <CoreDataTable
      :headers="headers as any"
      density="compact"
      :items="needtoAccept"
      :items-per-page="itemsPerPage"
    >
      <template #bottom />

      <template #item.type="{ internalItem: item }">
        {{ typeFromNumberCode(item.columns.type) }}
      </template>

      <template #item.created_at="{ internalItem }">
        {{ formatDate(internalItem.columns.created_at) }}
      </template>

      <template #item.accepted="{ item: item }">
        <CoreButton
          v-show="!item.accepted_by"
          button-type="primary"
          :disabled="!hasCurrentMemberPermission('writeAlert')"
          @click="$emit('acceptItem', item.id)"
        >
          {{ $t("uiComponents.eventListTable.headers.accept") }}
        </CoreButton>
      </template>

      <!-- mobile version of open events table -->
      <template v-if="$vuetify.display.mobile" #headers />
      <template v-if="$vuetify.display.mobile" #body="{ items }">
        <tr v-for="(item, key) in items" :key="key" class="v-data-table__mobile-table-row">
          <td class="v-data-table__mobile-row">
            <div class="v-data-table__mobile-row__header">
              {{ $t("uiComponents.eventListTable.headers.type") }}
            </div>
            <div class="v-data-table__mobile-row__cell">
              {{ item ? typeFromNumberCode(item?.type) : "" }}
            </div>
          </td>
          <td class="v-data-table__mobile-row">
            <div class="v-data-table__mobile-row__header">
              {{ $t("uiComponents.eventListTable.headers.text") }}
            </div>
            <div class="v-data-table__mobile-row__cell pl-5">
              {{ item?.body }}
            </div>
          </td>
          <td class="v-data-table__mobile-row">
            <div class="v-data-table__mobile-row__header">
              {{ $t("uiComponents.eventListTable.headers.date") }}
            </div>
            <div class="v-data-table__mobile-row__cell">
              {{ item ? formatDate(item?.created_at) : "" }}
            </div>
          </td>
          <td class="v-data-table__mobile-row">
            <div class="v-data-table__mobile-row__header">
              {{ $t("uiComponents.eventListTable.headers.accept") }}
            </div>
            <div class="v-data-table__mobile-row__cell">
              <CoreButton
                v-show="!item?.accepted_by"
                button-type="primary"
                :disabled="!hasCurrentMemberPermission('writeAlert')"
                @click="$emit('acceptItem', item.id)"
              >
                {{ $t("uiComponents.eventListTable.headers.accept") }}
              </CoreButton>
            </div>
          </td>
        </tr>
      </template>
    </CoreDataTable>
    <div style="max-width: 90%; margin-inline: auto">
      <CorePagination
        :model-value="modelValue"
        :length="pageCount"
        @update:model-value="(e: number) => pageSwap(e)"
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
import { formatDate } from "@/utils/utilsFunctions";

export default defineComponent({
  props: {
    needtoAccept: { default: () => [], type: Array as PropType<any[]> },
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
          width: "15%",
          sortable: false,
          key: "accepted",
        },
      ];
    },
    getIsAllAccepted(): any {
      return this.$store.getters["events/getIsAllAccepted"];
    },
    hasCurrentMemberPermission(): (permission: string) => boolean {
      return this.$store.getters["members/hasPermission"];
    },
  },
  methods: {
    pageSwap(newPage: number) {
      console.log("pageSwap open events table", newPage);
      this.$emit("pageSwap", newPage, false);
    },
  },
});
</script>
