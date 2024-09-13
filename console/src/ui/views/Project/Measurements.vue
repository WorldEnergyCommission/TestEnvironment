<template>
  <div class="project-measurements">
    <div class="measurements-table-wrapper">
      <CoreDataTable
        :headers="headers as any"
        :items="filteredMeasurements"
        class="elevation-0 measurements-table"
        density="compact"
        :items-per-page="-1"
      >
        <template #bottom />
        <template v-if="$vuetify.display.mobile" #headers />

        <template v-if="$vuetify.display.mobile" #body="{ items }">
          <tr v-for="item in items" :key="item.name" class="v-data-table__tr" style="">
            <td class="mobile-td" style="max-width: 60dvw">
              <div style="font-weight: 600">Name</div>
              {{ item.name }}
            </td>
            <td
              class="v-data-table__td v-data-table-column--align-end mobile-td"
              style="max-width: 40dvw"
            >
              <div class="pl-5" style="font-weight: 600">Value</div>
              {{ item.value }}
            </td>
          </tr>
        </template>
      </CoreDataTable>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { RootState } from "@/store/types";

/**
 * Measurements page that shows measurements list
 */
export default defineComponent({
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    /**
     * Header for measurements table
     */
    headers() {
      return [
        { title: this.$t("uiComponents.measurementsTable.headers.name"), key: "name" },
        {
          title: this.$t("uiComponents.measurementsTable.headers.value"),
          key: "value",
          sortable: false,
          align: "end",
        },
      ];
    },
    /**
     * Getter map measurements list,
     * remove all measurements which name length = 0,
     * set value rounded if it has to many numbers after coma,
     * if the value is a string and is longer than 30 characters, truncates it
     */
    measurementsList() {
      return Object.entries(this.measurements)
        .map((meas: any) => {
          const value: any = meas[1];
          const roundedValue = (value: any) => {
            return Math.round(value * 1e2) / 1e2;
          };
          const actualValue = (value: any) => {
            if (typeof value === "number") return roundedValue(value);
            if (typeof value === "string") return value.slice(0, 30);
            return value;
          };
          return { name: meas[0], value: actualValue(value) };
        })
        .filter((meas: { name: string; value: string }) => meas.name.length);
    },
    measurementsFilter() {
      return this.measurementsState.measurementsFilter;
    },
    filteredMeasurements() {
      return this.measurementsFilter
        ? this.measurementsList.filter((variable: any) =>
            Object.values(variable)
              .join()
              .toLowerCase()
              .includes(this.measurementsFilter.toLowerCase()),
          )
        : this.measurementsList;
    },
    measurements(): any {
      return this.$store.getters["measurements/measurements"];
    },
  },
  async created() {
    await this.fetchMeasurements(this.$route.params.id as string);
  },
  methods: {
    fetchMeasurements(projectId: string): Promise<Promise<void>> {
      return this.$store.dispatch("measurements/fetchMeasurements", projectId);
    },
  },
});
</script>

<style lang="scss">
.mobile-td {
  overflow: hidden;
  text-overflow: ellipsis;
  border-width: 0;
  border-bottom: thin solid rgba(0, 0, 0, 0.12);
}
.project-measurements {
  .measurements-title {
    font-size: 25px;
    line-height: 1;
  }

  .measurements-table-wrapper {
    overflow: auto;

    .measurements-table {
      .v-list .v-list-item--active {
        background: #000 !important;
      }

      .v-data-table-header {
        th {
          height: 60px !important;
          padding: 0 !important;

          span {
            font-size: 20px;
            color: rgb(var(--v-theme-lynusText)) !important;
          }
        }
      }

      tbody {
        tr {
          &:hover {
            background: rgb(var(--v-theme-secondary)) !important;
          }
        }

        td {
          padding: 0 !important;
          font-size: 15px !important;
          color: rgb(var(--v-theme-lynusText)) !important;
        }
      }
    }
  }
}
</style>
