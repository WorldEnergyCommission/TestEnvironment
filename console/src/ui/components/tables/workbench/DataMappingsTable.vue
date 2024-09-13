<template>
  <div>
    <CoreDataTable
      v-model:page="currentPage"
      :headers="headers"
      :items="items"
      :items-per-page="itemsPerPage"
      class="elevation-0"
      hide-default-footer
      :loading="loading"
    >
      <!-- bar on top of table with create button and title with tooltip-->
      <template #top>
        <CoreToolbar class="justify-between">
          <div class="d-flex flex-row align-center ms-3">
            <CoreToolbarTitle class="flex-grow-1">
              {{ $t("workbench.modules.dataMappings.title") }}
            </CoreToolbarTitle>
            <CoreTooltip location="bottom">
              <template #activator="{ props }">
                <CoreButton button-type="standardIcon" v-bind="props">
                  <CoreIcon color="accent" size="16"> fas fa-info </CoreIcon>
                </CoreButton>
              </template>
              <span>
                {{ $t("workbench.modules.dataMappings.text") }}
              </span>
            </CoreTooltip>
          </div>
          <CoreSpacer v-if="!$vuetify.display.mobile" />
          <DataMappingCreateModal @done="fetchDataMappings" />
        </CoreToolbar>
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
              {{ item.type }}
            </div>
          </td>
          <td class="v-data-table__mobile-row">
            <div class="v-data-table__mobile-row__header">
              {{ $t("workbench.modules.dataMappings.groups") }}
            </div>
            <div class="v-data-table__mobile-row__cell">
              <CoreChip v-for="group in item?.complete_mappings" :key="`${item?.id}${group}`">
                {{ group }}
              </CoreChip>
            </div>
          </td>
          <td class="v-data-table__mobile-row">
            <div class="v-data-table__mobile-row__header">
              {{ $t("uiComponents.workbenchTable.actions") }}
            </div>
            <div class="v-data-table__mobile-row__cell">
              <div class="d-flex justify-end">
                <DataMappingManageModal :data-mapping="item" @done="fetchDataMappings" />

                <DeleteModalForm
                  :deleted-item-name="item.name"
                  color="accent"
                  @delete-handler="deleteControlHandle(item)"
                >
                  <CoreButton button-type="standardIcon" icon-name="trash" />
                </DeleteModalForm>
              </div>
            </div>
          </td>
        </tr>
      </template>
      <template #item.groups="{ item }">
        <CoreChip v-for="group in item.complete_mappings" :key="`${item?.id}${group}`">
          {{ group }}
        </CoreChip>
      </template>
      <!--- Last column Actions -->
      <template v-if="!$vuetify.display.mobile" #item.actions="{ item }">
        <div class="d-flex justify-end">
          <DataMappingManageModal :data-mapping="item" @done="fetchDataMappings" />

          <DeleteModalForm
            :deleted-item-name="item.name"
            color="accent"
            @delete-handler="deleteControlHandle(item)"
          >
            <CoreButton button-type="standardIcon">
              <div>
                <lynus-icon name="trash" size="20" />
              </div>
            </CoreButton>
          </DeleteModalForm>
        </div>
      </template>

      <template #bottom />
    </CoreDataTable>
    <div style="max-width: 600px; margin: auto">
      <CorePagination v-model="currentPage" :length="paginationLength" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import api from "@/store/api";
import { DataMapping } from "@/store/modules/dataMappings/types";
import { RootState } from "@/store/types";
import DataMappingCreateModal from "@/ui/components/modals/DataMapping/DataMappingCreateModal.vue";
import DataMappingManageModal from "@/ui/components/modals/DataMapping/DataMappingManageModal.vue";
import DeleteModalForm from "@/ui/components/modals/DeleteModalForm.vue";

/**
 * Component that shows table of devices
 */
export default defineComponent({
  components: {
    DeleteModalForm,
    DataMappingCreateModal,
    DataMappingManageModal,
  },
  props: {
    itemsPerPage: { default: 100, type: Number },
  },
  data() {
    const items: DataMapping[] = [];

    return {
      currentPage: 1,
      loading: false,
      items,
    };
  },
  computed: {
    projectsState() {
      return (this.$store.state as RootState).projects;
    },
    headers(): any {
      return [
        { title: this.$t("uiComponents.workbenchTable.name"), align: "start", value: "name" },
        { title: this.$t("uiComponents.workbenchTable.type"), value: "type" },
        {
          title: this.$t("workbench.modules.dataMappings.groups"),
          sortable: false,
          value: "groups",
        },
        {
          title: this.$t("uiComponents.workbenchTable.actions"),
          value: "actions",
          sortable: false,
          align: "end",
        },
      ];
    },
    paginationLength() {
      return Math.floor(this.items.length / this.itemsPerPage) + 1;
    },
  },
  created() {
    this.fetchDataMappings();
  },
  methods: {
    async fetchDataMappings() {
      try {
        this.loading = true;
        const response = await api.fetch(
          `/projects/${this.projectsState.projectId}/data-mapping/list`,
          "GET",
        );
        this.items = response as DataMapping[];
      } catch (e: any) {
        this.setReport({
          type: "error",
          message: e?.message,
          value: true,
        });
      } finally {
        this.loading = false;
      }
    },
    async deleteControlHandle(item: DataMapping) {
      try {
        this.loading = true;
        const response = await api.fetch(
          `/projects/${this.projectsState.projectId}/data-mapping/${item.id}`,
          "DELETE",
        );

        this.fetchDataMappings();
      } catch (e: any) {
        this.setReport({
          type: "error",
          message: e?.message,
          value: true,
        });
      } finally {
        this.loading = false;
      }
    },
    setReport(payload: any) {
      this.$store.commit("app/setReport", payload);
    },
  },
});
</script>
