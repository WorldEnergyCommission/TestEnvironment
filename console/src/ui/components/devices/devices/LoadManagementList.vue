<template>
  <div>
    <DeviceLayout :device-data="deviceData" :is-preview="isPreview" :preview-data="deviceData">
      <template #basic-controls>
        <div class="load-management-list">
          <div v-if="vehicleRecords.length === 0" class="text-center pa-4">
            <lynus-icon name="car" size="48" color="grey" class="mb-2" />
            <div class="text-grey mb-3">{{ $t("devices.LoadManagementList.noVehicles") }}</div>
          </div>

          <div v-else class="vehicle-table">
            <!-- Vehicle Table -->
            <CoreDataTable
              :headers="tableHeaders"
              :items="paginatedVehicles"
              class="elevation-1"
              item-key="id"
              :items-per-page="itemsPerPage"
              :hide-default-footer="true"
            >
              <!-- Status Column -->
              <template #[`item.status`]="{ item }">
                <CoreChip :color="getStatusColor(item.status)" size="small">
                  {{ getStatusText(item.status) }}
                </CoreChip>
              </template>

              <!-- Priority Column -->
              <template #[`item.priority`]="{ item }">
                <span>{{ item.priority }}</span>
              </template>

              <!-- Max Power Column -->
              <template #[`item.maxPower`]="{ item }">
                <span>{{ formatMaxPower(item.maxPower) }}</span>
              </template>

              <!-- Actions Column -->
              <template #[`item.actions`]="{ item }">
                <CoreTooltip :text="$t('devices.LoadManagementList.viewDetails')">
                  <CoreButton size="small" variant="text" @click="viewVehicleDetails(item)">
                    <template #icon>
                      <lynus-icon name="information-outline" size="16" />
                    </template>
                  </CoreButton>
                </CoreTooltip>
              </template>
            </CoreDataTable>

            <!-- Custom Pagination -->
            <div v-if="totalPages > 1" class="d-flex justify-center align-center pa-3">
              <CoreButton
                :disabled="currentPage === 1"
                icon="mdi-chevron-left"
                size="small"
                variant="text"
                @click="previousPage"
              />

              <div class="pagination-info mx-3">
                {{ $t("common.pageOf", { current: currentPage, total: totalPages }) }}
              </div>

              <CoreButton
                :disabled="currentPage === totalPages"
                icon="mdi-chevron-right"
                size="small"
                variant="text"
                @click="nextPage"
              />
            </div>
          </div>
        </div>
      </template>
      <template #dnd>
        <slot name="dnd" />
      </template>
    </DeviceLayout>

    <!-- Vehicle Details Dialog -->
    <CoreDialog v-model="detailsDialog" max-width="500">
      <CoreCard v-if="selectedVehicle">
        <CoreCardTitle class="d-flex align-center">
          <lynus-icon name="car" size="24" class="mr-2" />
          {{ selectedVehicle.plate }}
        </CoreCardTitle>
        <CoreCardText>
          <CoreContainer fluid class="pa-0">
            <CoreRow>
              <CoreColumn cols="6">
                <div class="detail-item">
                  <div class="text-caption text-grey">
                    {{ $t("devices.LoadManagementList.fields.status") }}
                  </div>
                  <CoreChip :color="getStatusColor(selectedVehicle.status)" size="small">
                    {{ getStatusText(selectedVehicle.status) }}
                  </CoreChip>
                </div>
              </CoreColumn>
              <CoreColumn cols="6">
                <div class="detail-item">
                  <div class="text-caption text-grey">
                    {{ $t("devices.LoadManagementList.fields.company") }}
                  </div>
                  <div>{{ selectedVehicle.company }}</div>
                </div>
              </CoreColumn>
              <CoreColumn cols="6">
                <div class="detail-item">
                  <div class="text-caption text-grey">
                    {{ $t("devices.LoadManagementList.fields.brand") }}
                  </div>
                  <div>{{ selectedVehicle.brand }}</div>
                </div>
              </CoreColumn>
              <CoreColumn cols="6">
                <div class="detail-item">
                  <div class="text-caption text-grey">
                    {{ $t("devices.LoadManagementList.fields.model") }}
                  </div>
                  <div>{{ selectedVehicle.model }}</div>
                </div>
              </CoreColumn>
              <CoreColumn cols="6">
                <div class="detail-item">
                  <div class="text-caption text-grey">
                    {{ $t("devices.LoadManagementList.fields.driver") }}
                  </div>
                  <div>{{ selectedVehicle.driver }}</div>
                </div>
              </CoreColumn>
              <CoreColumn cols="6">
                <div class="detail-item">
                  <div class="text-caption text-grey">
                    {{ $t("devices.LoadManagementList.fields.priority") }}
                  </div>
                  <div>{{ selectedVehicle.priority }}</div>
                </div>
              </CoreColumn>
              <CoreColumn cols="6">
                <div class="detail-item">
                  <div class="text-caption text-grey">
                    {{ $t("devices.LoadManagementList.fields.maxPower") }}
                  </div>
                  <div>{{ formatMaxPower(selectedVehicle.maxPower) }}</div>
                </div>
              </CoreColumn>
              <CoreColumn v-if="selectedVehicle.chipNummer" cols="6">
                <div class="detail-item">
                  <div class="text-caption text-grey">
                    {{ $t("devices.LoadManagementList.fields.chipNummer") }}
                  </div>
                  <div>{{ selectedVehicle.chipNummer }}</div>
                </div>
              </CoreColumn>
            </CoreRow>
          </CoreContainer>
        </CoreCardText>
      </CoreCard>
    </CoreDialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { IVehicleRecord } from "@/store/modules/devices/types";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represents LoadManagementList device
 */
export default defineComponent({
  components: {
    DeviceLayout,
  },
  mixins: [DeviceBase],
  data() {
    return {
      detailsDialog: false,
      selectedVehicle: null as IVehicleRecord | null,

      // Pagination
      currentPage: 1,
      itemsPerPage: 15,
    };
  },
  computed: {
    vehicleRecords(): IVehicleRecord[] {
      const records = (this.deviceData?.data?.loadManagementData?.records || []) as Array<
        Partial<IVehicleRecord>
      >;

      return records.map((record) => ({
        ...record,
        priority: record.priority ?? 1,
        maxPower: record.maxPower ?? 0,
      })) as IVehicleRecord[];
    },
    paginatedVehicles(): IVehicleRecord[] {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.vehicleRecords.slice(start, end);
    },
    totalPages(): number {
      return Math.ceil(this.vehicleRecords.length / this.itemsPerPage);
    },
    tableHeaders() {
      return [
        { title: this.$t("devices.LoadManagementList.fields.plate"), key: "plate", sortable: true },
        {
          title: this.$t("devices.LoadManagementList.fields.status"),
          key: "status",
          sortable: true,
        },
        {
          title: this.$t("devices.LoadManagementList.fields.company"),
          key: "company",
          sortable: true,
        },
        { title: this.$t("devices.LoadManagementList.fields.brand"), key: "brand", sortable: true },
        {
          title: this.$t("devices.LoadManagementList.fields.model"),
          key: "model",
          sortable: true,
        },
        {
          title: this.$t("devices.LoadManagementList.fields.driver"),
          key: "driver",
          sortable: true,
        },
        {
          title: this.$t("devices.LoadManagementList.fields.priority"),
          key: "priority",
          sortable: true,
        },
        {
          title: this.$t("devices.LoadManagementList.fields.maxPower"),
          key: "maxPower",
          sortable: true,
        },
        {
          title: this.$t("devices.LoadManagementList.fields.chipNummer"),
          key: "chipNummer",
          sortable: true,
        },
      ];
    },
  },
  methods: {
    viewVehicleDetails(vehicle: IVehicleRecord) {
      this.selectedVehicle = vehicle;
      this.detailsDialog = true;
    },

    formatMaxPower(power: number | null | undefined): string {
      if (power === null || power === undefined || Number.isNaN(power)) {
        return "—";
      }

      const formatter = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      });

      return `${formatter.format(power)} kW`;
    },

    getStatusColor(status: string): string {
      return status === "aktiv" ? "success" : "error";
    },

    getStatusText(status: string): string {
      return this.$t(
        `devices.LoadManagementList.status.${status === "aktiv" ? "active" : "inactive"}`,
      );
    },

    changePage(page: number) {
      this.currentPage = page;
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.load-management-list {
  width: 100%;
}

.detail-item {
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
