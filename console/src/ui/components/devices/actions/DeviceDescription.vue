<template>
  <FormModal :form-title="description.title">
    <template #activator>
      <CoreButton height="30" icon width="30" button-type="standardIcon">
        <CoreIcon color="accent" size="18"> fas fa-info </CoreIcon>
      </CoreButton>
    </template>
    <template #content>
      <div class="device-description-body">
        <div class="device-description-body__content">
          <div class="header">
            <div v-html="description.overview" />
          </div>
          <div class="table">
            <CoreTable>
              <template #default>
                <thead>
                  <tr>
                    <th class="text-left">
                      {{ $t("uiComponents.deviceDescriptionTable.name") }}
                    </th>
                    <th class="text-left">
                      {{ $t("uiComponents.deviceDescriptionTable.description") }}
                    </th>
                    <th class="text-left">
                      {{ $t("uiComponents.deviceDescriptionTable.allowedValues") }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in description.table" :key="index">
                    <td>{{ item.name }}</td>
                    <td v-html="item.description" />
                    <td v-html="item.allowedValues" />
                  </tr>
                </tbody>
              </template>
            </CoreTable>
          </div>
        </div>
      </div>
    </template>
  </FormModal>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { DeviceDescription } from "./DeviceDescriptionModel";
import FormModal from "@/ui/components/modals/FormModal.vue";

// Properties
interface Props {
  description: DeviceDescription;
  isOverviewCentered: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOverviewCentered: false,
});

// Constants
const dialog = ref<boolean>(false);
</script>

<style lang="scss">
@import "./src/ui/scss/variables";

.device-description-body {
  &__content {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 80dvh;

    .header {
      font-size: 15px;
    }

    .table {
      padding-bottom: 10px;

      thead {
        tr {
          th {
            padding: 0 10px !important;
          }
        }
      }

      tbody {
        tr {
          padding: 5px 0 !important;

          &:hover {
            background: rgb(var(--v-theme-secondary)) !important;
          }
        }

        td {
          padding: 0 10px !important;
          font-size: 15px !important;
          height: 60px !important;
          color: rgb(var(--v-theme-lynusText)) !important;

          &:last-of-type,
          &:first-of-type {
            width: 25%;
          }
        }
      }
    }
  }
}
</style>
