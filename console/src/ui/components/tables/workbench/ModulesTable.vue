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
            <CoreToolbarTitle class="flex-shrink-1">
              {{ $t("workbench.modules.modules.title") }}
            </CoreToolbarTitle>
            <CoreTooltip location="bottom">
              <template #activator="{ props }">
                <CoreButton button-type="standardIcon" v-bind="props">
                  <CoreIcon color="accent" size="16"> fas fa-info </CoreIcon>
                </CoreButton>
              </template>
              <span>
                {{ $t("workbench.modules.modules.text") }}
              </span>
            </CoreTooltip>
          </div>
          <CoreSpacer />
          <CreateModule @done="fetchModules" />
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
              {{ $t("workbench.modules.modules.areas") }}
            </div>
            <div class="v-data-table__mobile-row__cell">
              {{ item.type }}
            </div>
          </td>
          <td class="v-data-table__mobile-row">
            <div class="v-data-table__mobile-row__header">
              {{ $t("uiComponents.workbenchTable.actions") }}
            </div>
            <div class="v-data-table__mobile-row__cell">
              <div class="d-flex justify-end">
                <ManageModuleForm :device="item" @done="fetchModules" />

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

      <!--- Last column Actions -->
      <template v-if="!$vuetify.display.mobile" #item.actions="{ item }">
        <div class="d-flex justify-end">
          <ManageModuleForm :device="item" @done="fetchModules" />

          <DeleteModalForm
            :deleted-item-name="item.name"
            color="accent"
            @delete-handler="deleteControlHandle(item)"
          >
            <CoreButton button-type="standardIcon" icon-name="trash" />
          </DeleteModalForm>
        </div>
      </template>
      <template v-if="!$vuetify.display.mobile" #item.collection="{ item }">
        <ModuleRoomSelector :module-id="item.id" :room-id="item.collection_id" />
      </template>
    </CoreDataTable>
    <div style="max-width: 600px; margin: auto">
      <CorePagination v-model="currentPage" :length="paginationLength" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import api from "@/store/api";
import { ModuleType } from "@/store/modules/modules/types";
import { RootState } from "@/store/types";
import ModuleRoomSelector from "@/ui/components/forms/Modules/ModuleRoomSelector.vue";
import DeleteModalForm from "@/ui/components/modals/DeleteModalForm.vue";
import CreateModule from "@/ui/components/modals/Modules/CreateModule.vue";
import ManageModuleForm from "@/ui/components/modals/Modules/ManageModule.vue";

/**
 * Component that shows table of devices
 */
export default defineComponent({
  components: {
    DeleteModalForm,
    CreateModule,
    ManageModuleForm,
    ModuleRoomSelector,
  },
  props: {
    itemsPerPage: { default: 100, type: Number },
  },
  data() {
    const items: ModuleType[] = [];

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
        { title: this.$t("workbench.modules.modules.areas"), value: "collection" },
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
    this.fetchModules();
  },
  methods: {
    async fetchModules() {
      try {
        this.loading = true;
        const response = await api.fetch(
          `/projects/${this.projectsState.projectId}/modules/list`,
          "GET",
        );
        this.items = response;
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
    async deleteControlHandle(item: ModuleType) {
      try {
        this.loading = true;
        const response = await api.fetch(
          `/projects/${this.projectsState.projectId}/modules/${item.id}`,
          "DELETE",
        );

        this.fetchModules();
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
