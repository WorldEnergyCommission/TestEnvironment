<!-- eslint-disable vuetify/no-deprecated-components -->
<template>
  <div class="load-management-schema h-100">
    <Stepper v-model="stage">
      <StepperHeader :stage="stage" translation-sub-path="manageDevice" />

      <StepperWindow>
        <!-- Step 1: Device Name -->
        <Step :step="1">
          <template #content>
            <CoreContainer fluid>
              <CoreRow>
                <CoreColumn offset-sm="4" sm="4">
                  <CoreTextField
                    v-model="device.name"
                    :label="$t('modals.manageDevice.form.name')"
                    hide-details
                    max-length="30"
                  />
                </CoreColumn>
              </CoreRow>
            </CoreContainer>
          </template>
          <template #footer>
            <FirstStepActions
              :disable-next-button="!isDeviceNameValid"
              :next-button-tool-tip="$t('modals.manageDevice.tooltips.nameType')"
              :show-back-button="!isEditModal"
              :hide-next-tool-tip="isDeviceNameValid"
              @back="$emit('backToChoosingType')"
              @next="stage = 2"
            />
          </template>
        </Step>

        <!-- Step 2: Vehicle Records Management -->
        <Step :step="2">
          <template #content>
            <CoreContainer fluid class="load-management-content">
              <CoreRow class="mb-4">
                <CoreColumn cols="12">
                  <div class="d-flex justify-space-between align-center mb-4">
                    <h3>{{ $t("devices.LoadManagementList.title") }}</h3>
                    <CoreButton button-type="primary" @click="openAddRecordDialog">
                      <template #icon>
                        <lynus-icon name="plus" size="16" />
                      </template>
                      {{ $t("devices.LoadManagementList.actions.addVehicle") }}
                    </CoreButton>
                  </div>
                </CoreColumn>
              </CoreRow>

              <!-- Vehicle Records Table -->
              <CoreRow>
                <CoreColumn cols="12">
                  <CoreDataTable
                    :headers="tableHeaders"
                    :items="vehicleRecords"
                    class="elevation-1"
                    item-key="id"
                  >
                    <template #[`item.actions`]="{ item }">
                      <CoreButton @click="editRecord(item)">
                        <template #icon>
                          <CoreIcon> mdi:mdi-pencil </CoreIcon>
                        </template>
                      </CoreButton>
                      <CoreButton @click="deleteRecord(item)">
                        <template #icon>
                          <CoreIcon> mdi:mdi-delete </CoreIcon>
                        </template>
                      </CoreButton>
                    </template>
                  </CoreDataTable>
                </CoreColumn>
              </CoreRow>
            </CoreContainer>
          </template>
          <template #footer>
            <SecondStepActions
              :disable-next-button="!isValidConfiguration"
              :next-button-tool-tip="$t('modals.manageDevice.tooltips.requiredFields')"
              :hide-next-tool-tip="isValidConfiguration"
              @back="stage = 1"
              @next="stage = 3"
            />
          </template>
        </Step>

        <!-- Step 3: Settings (Room and Width Selection) -->
        <Step :step="3">
          <template #content>
            <CoreContainer fluid>
              <CoreRow>
                <CoreColumn cols="6" offset="3">
                  <CoreSelect
                    v-model="device.collection_id"
                    :items="sortedRooms"
                    :label="$t('modals.manageDevice.form.areas')"
                    hide-details
                    hide-selected
                    item-title="name"
                    item-value="id"
                  />
                  <CoreSelect
                    v-model="device.data.selectedWidth"
                    :items="chartWidthOptions"
                    :label="$t('modals.manageCharts.form.width')"
                    hide-details
                    hide-selected
                    style="padding-top: 10px"
                  />
                </CoreColumn>
              </CoreRow>
            </CoreContainer>
          </template>
          <template #footer>
            <FinalStepActions
              :disable-next-button="!settingsValidation"
              :next-button-tool-tip="$t('modals.manageDevice.tooltips.areaFields')"
              :hide-next-tool-tip="settingsValidation"
              @back="stage = 2"
              @next="sendForm"
            />
          </template>
        </Step>
      </StepperWindow>
    </Stepper>

    <!-- Add/Edit Record Dialog -->
    <CoreDialog v-model="recordDialog" max-width="600">
      <CoreCard>
        <CoreCardTitle>
          {{
            editingRecord
              ? $t("devices.LoadManagementList.editRecord")
              : $t("devices.LoadManagementList.addRecord")
          }}
        </CoreCardTitle>
        <CoreCardText>
          <CoreContainer fluid>
            <CoreRow>
              <CoreColumn cols="12" sm="6">
                <CoreTextField
                  v-model="currentRecord.plate"
                  :label="$t('devices.LoadManagementList.fields.plate')"
                  :rules="[rules.required]"
                  required
                />
              </CoreColumn>
              <CoreColumn cols="12" sm="6">
                <CoreSelect
                  v-model="currentRecord.status"
                  :items="statusOptions"
                  :label="$t('devices.LoadManagementList.fields.status')"
                  :rules="[rules.required]"
                  required
                />
              </CoreColumn>
              <CoreColumn cols="12" sm="6">
                <CoreTextField
                  v-model="currentRecord.company"
                  :label="$t('devices.LoadManagementList.fields.company')"
                  :rules="[rules.required]"
                  required
                />
              </CoreColumn>
              <CoreColumn cols="12" sm="6">
                <CoreTextField
                  v-model="currentRecord.brand"
                  :label="$t('devices.LoadManagementList.fields.brand')"
                  :rules="[rules.required]"
                  required
                />
              </CoreColumn>
              <CoreColumn cols="12" sm="6">
                <CoreTextField
                  v-model="currentRecord.model"
                  :label="$t('devices.LoadManagementList.fields.model')"
                  :rules="[rules.required]"
                  required
                />
              </CoreColumn>
              <CoreColumn cols="12" sm="6">
                <CoreTextField
                  v-model="currentRecord.driver"
                  :label="$t('devices.LoadManagementList.fields.driver')"
                  :rules="[rules.required]"
                  required
                />
              </CoreColumn>
              <CoreColumn cols="12" sm="6">
                <CoreSelect
                  v-model="currentRecord.priority"
                  :items="priorityOptions"
                  :label="$t('devices.LoadManagementList.fields.priority')"
                  :rules="[rules.required]"
                  required
                />
              </CoreColumn>
              <CoreColumn cols="12" sm="6">
                <CoreTextField
                  v-model="currentRecord.maxPower"
                  :label="$t('devices.LoadManagementList.fields.maxPower')"
                  :rules="[rules.required]"
                  type="number"
                  step="0.1"
                  suffix="kW"
                  required
                />
              </CoreColumn>
              <CoreColumn cols="12" sm="6">
                <CoreTextField
                  v-model="currentRecord.chipNummer"
                  :label="$t('devices.LoadManagementList.fields.chipNummer')"
                  :rules="[rules.required, rules.integer]"
                  type="number"
                  required
                />
              </CoreColumn>
            </CoreRow>
          </CoreContainer>
        </CoreCardText>
        <CoreCardActions>
          <CoreSpacer />
          <CoreButton variant="text" @click="recordDialog = false">
            {{ $t("uiComponents.buttons.cancel") }}
          </CoreButton>
          <CoreButton button-type="primary" class="mr-6" @click="saveRecord">
            {{ $t("uiComponents.buttons.save") }}
          </CoreButton>
        </CoreCardActions>
      </CoreCard>
    </CoreDialog>

    <!-- Delete Confirmation Dialog -->
    <CoreDialog v-model="deleteDialog" max-width="400">
      <CoreCard>
        <CoreCardTitle>{{ $t("common.confirmDelete") }}</CoreCardTitle>
        <CoreCardText>
          {{
            $t("devices.LoadManagementList.deleteConfirmation", {
              plate: recordToDelete?.plate,
            })
          }}
        </CoreCardText>
        <CoreCardActions>
          <CoreSpacer />
          <CoreButton variant="text" @click="deleteDialog = false">
            {{ $t("uiComponents.buttons.cancel") }}
          </CoreButton>
          <CoreButton color="error" @click="confirmDelete">
            {{ $t("uiComponents.buttons.delete") }}
          </CoreButton>
        </CoreCardActions>
      </CoreCard>
    </CoreDialog>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";

import {
  FinalStepActions,
  FirstStepActions,
  SecondStepActions,
} from "@/ui/components/modals/components/Actions";
import StepperHeader from "@/ui/components/modals/components/ManageStepperHeader.vue";
import { Step, Stepper, StepperWindow } from "@/ui/components/modals/components/Stepper";
import SchemaBase from "./SchemaBase";

export default {
  name: "LoadManagementSchema",
  components: {
    FirstStepActions,
    SecondStepActions,
    FinalStepActions,
    StepperHeader,
    Step,
    Stepper,
    StepperWindow,
  },
  extends: SchemaBase,
  emits: ["handleControl", "closeDialog", "backToChoosingType"],
  data() {
    return {
      recordDialog: false,
      deleteDialog: false,
      editingRecord: false,
      recordToDelete: null,
      currentRecord: {
        plate: "",
        status: "aktiv",
        company: "",
        brand: "",
        model: "",
        driver: "",
        priority: 1,
        maxPower: null,
        uid: "",
        chipNummer: "",
      },
      vehicleRecords: [],
    };
  },
  computed: {
    isDeviceNameValid() {
      return this.device.name && this.device.name.trim().length > 0;
    },
    isValidConfiguration() {
      return true; // Allow empty lists
    },
    tableHeaders() {
      return [
        { title: this.$t("devices.LoadManagementList.fields.plate"), key: "plate" },
        { title: this.$t("devices.LoadManagementList.fields.status"), key: "status" },
        { title: this.$t("devices.LoadManagementList.fields.company"), key: "company" },
        { title: this.$t("devices.LoadManagementList.fields.brand"), key: "brand" },
        { title: this.$t("devices.LoadManagementList.fields.model"), key: "model" },
        { title: this.$t("devices.LoadManagementList.fields.driver"), key: "driver" },
        { title: this.$t("devices.LoadManagementList.fields.priority"), key: "priority" },
        { title: this.$t("devices.LoadManagementList.fields.maxPower"), key: "maxPower" },
        { title: this.$t("devices.LoadManagementList.fields.chipNummer"), key: "chipNummer" },
        { title: "", key: "actions", sortable: false },
      ];
    },
    statusOptions() {
      return [
        { title: this.$t("devices.LoadManagementList.status.active"), value: "aktiv" },
        { title: this.$t("devices.LoadManagementList.status.inactive"), value: "inaktiv" },
      ];
    },
    priorityOptions() {
      return [
        { title: "1", value: 1 },
        { title: "2", value: 2 },
        { title: "3", value: 3 },
      ];
    },
    rules() {
      return {
        required: (value) => !!value || this.$t("validation.required"),
        integer: (value) => {
          if (!value) return true; // Let required rule handle empty values
          const num = parseInt(value, 10);
          return (
            (!isNaN(num) && num.toString() === value.toString()) ||
            this.$t("validation.mustBeInteger")
          );
        },
      };
    },
    chartWidthOptions() {
      return ["full", "half"];
    },
    settingsValidation() {
      return !!this.device.collection_id && !!this.device.data.selectedWidth;
    },
  },
  async created() {
    const copy = JSON.parse(JSON.stringify(this.deviceData));
    this.device = copy;
    if (this.activeRoomId.length && !this.isEditModal)
      this.device.collection_id = this.activeRoomId;

    // Initialize device type
    this.device.data.type = "LoadManagementList";
    if (!this.device.data.meta) this.device.data.meta = {};

    // Initialize selectedWidth - use existing value or default to "full"
    this.selectedWidth = this.device.data.selectedWidth || "full";
    if (!this.device.data.selectedWidth) {
      this.device.data.selectedWidth = "full";
    }

    // Load existing records if editing
    if (this.isEditModal && this.device.data.loadManagementData) {
      const records = this.device.data.loadManagementData.records || [];
      this.vehicleRecords = records.map((record) => ({
        priority: record.priority ?? 1,
        maxPower: record.maxPower ?? 0,
        chipNummer: record.chipNummer ?? null,
        ...record,
      }));
    }
  },
  methods: {
    openAddRecordDialog() {
      this.editingRecord = false;
      this.currentRecord = {
        plate: "",
        status: "aktiv",
        company: "",
        brand: "",
        model: "",
        driver: "",
        priority: 1,
        maxPower: null,
        uid: "",
        chipNummer: "",
      };
      this.recordDialog = true;
    },
    editRecord(record) {
      this.editingRecord = true;
      this.currentRecord = {
        ...record,
        priority: record.priority ?? 1,
        maxPower: record.maxPower ?? 0,
        chipNummer: record.chipNummer ?? "",
      };
      this.recordDialog = true;
    },
    saveRecord() {
      const { priority, maxPower, chipNummer } = this.currentRecord;
      const hasMissingFields =
        !this.currentRecord.plate ||
        !this.currentRecord.status ||
        !this.currentRecord.company ||
        !this.currentRecord.brand ||
        !this.currentRecord.model ||
        !this.currentRecord.driver ||
        priority === null ||
        priority === undefined ||
        maxPower === null ||
        maxPower === "" ||
        maxPower === undefined ||
        chipNummer === null ||
        chipNummer === "" ||
        chipNummer === undefined;

      if (hasMissingFields) {
        return;
      }

      const priorityValue = Number(priority);
      const maxPowerValue = Number(maxPower);
      const chipNummerValue = parseInt(chipNummer, 10);

      if (
        Number.isNaN(priorityValue) ||
        Number.isNaN(maxPowerValue) ||
        Number.isNaN(chipNummerValue) ||
        ![1, 2, 3].includes(priorityValue) ||
        maxPowerValue < 0
      ) {
        return;
      }

      const recordToSave = {
        ...this.currentRecord,
        priority: priorityValue,
        maxPower: maxPowerValue,
        chipNummer: chipNummerValue,
      };

      if (this.editingRecord) {
        // Update existing record
        const index = this.vehicleRecords.findIndex((r) => r.id === this.currentRecord.id);
        if (index !== -1) {
          this.vehicleRecords[index] = recordToSave;
        }
      } else {
        // Add new record
        const newRecord = {
          ...recordToSave,
          id: uuidv4(),
        };
        this.vehicleRecords.push(newRecord);
      }

      this.updateDeviceData();

      // If in edit mode, persist changes to database immediately
      if (this.isEditModal) {
        this.persistVehicleChanges();
      }

      this.recordDialog = false;
    },
    deleteRecord(record) {
      this.recordToDelete = record;
      this.deleteDialog = true;
    },
    confirmDelete() {
      if (this.recordToDelete) {
        const index = this.vehicleRecords.findIndex((r) => r.id === this.recordToDelete.id);
        if (index !== -1) {
          this.vehicleRecords.splice(index, 1);
          this.updateDeviceData();

          // If in edit mode, persist changes to database immediately
          if (this.isEditModal) {
            this.persistVehicleChanges();
          }
        }
      }
      this.deleteDialog = false;
      this.recordToDelete = null;
    },
    updateDeviceData() {
      // Update device data with current records and width
      const loadManagementData = {
        records: this.vehicleRecords,
      };

      this.device.data = {
        ...this.device.data,
        type: "LoadManagementList",
        loadManagementData,
        selectedWidth: this.selectedWidth,
      };
    },

    async persistVehicleChanges() {
      try {
        // Create a copy of the current device data with updates
        const updatedDevice = JSON.parse(JSON.stringify(this.device));

        // Dispatch update to Vuex store which handles API call
        await this.$store.dispatch("devices/updateDevice", updatedDevice);
      } catch (error) {
        console.error("Error persisting vehicle changes:", error);
        // Optionally show user feedback here
      }
    },
    async sendForm() {
      const copy = JSON.parse(JSON.stringify(this.device));

      this.updateDeviceData();
      copy.data.meta.deviceSchema = { basicDevices: [], additionalBasicDevices: [] };

      // add rules
      if (!this.isEditModal) {
        await this.addRulesWhenCreateDevice(copy);
      } else {
        await this.addRulesWhenEditDevice(copy);
      }

      this.$emit("handleControl", copy);
      this.$emit("closeDialog");
    },
  },
};
</script>

<style lang="scss" scoped>
.load-management-content {
  min-height: 400px;
}

.load-management-schema {
  height: 100%;
}
</style>
