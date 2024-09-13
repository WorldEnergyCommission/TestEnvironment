<template>
  <CoreCard class="permissions-settings">
    <div class="permissions-settings-title">
      {{ $t("uiComponents.settings.permissions.title") }}
    </div>

    <div class="permissions-settings-content">
      <div class="user-search-wrapper">
        <CoreAutocomplete
          v-if="admin"
          v-model="model"
          :items="items"
          :label="$t('uiComponents.settings.permissions.searchFieldLabel')"
          :loading="loading"
          class="mb-8"
          clearable
          hide-details
          hide-no-data
          item-title="email"
          item-value="id"
          @update:search="(val) => (search = val)"
          @blur="clearItems"
        >
          <template #item="{ props, item }">
            <CoreListItem
              v-bind="props"
              :title="` ${item.raw.first_name} ${item.raw.last_name}`"
              :subtitle="item.raw.email"
            />
          </template>
          <template #selection="{ props, item }">
            <CoreListItem
              v-bind="props"
              :title="` ${item.raw.first_name} ${item.raw.last_name}`"
              :subtitle="item.raw.email"
            />
          </template>
        </CoreAutocomplete>
      </div>

      <div>
        <CoreDataTable
          :headers="headers"
          :items="sortedByOwner"
          class="elevation-0"
          disable-pagination
          hide-default-footer
          :items-per-page="-1"
        >
          <!-- disable pagination -->
          <template #bottom />

          <template #item.name="{ item }"> {{ item.first_name }} {{ item.last_name }} </template>
          <template v-if="admin" #item.actions="{ item }">
            <CoreButton
              :disabled="item.id === user.id"
              button-type="standardIcon"
              @click="deleteMember(item)"
            >
              <lynus-icon name="trash" size="20" />
            </CoreButton>
            <FormModal :form-title="$t('uiComponents.settings.permissions.formTitle')">
              <template #activator>
                <CoreButton button-type="standardIcon" icon-name="settings" />
              </template>
              <template #content>
                <ManagePermissionsForm :user="item" />
              </template>
            </FormModal>
          </template>

          <!-- mobile version of permissions data table -->
          <template v-if="$vuetify.display.mobile" #headers />
          <template v-if="$vuetify.display.mobile" #body="{ items }">
            <tr v-for="(item, index) in items" :key="index" class="v-data-table__mobile-table-row">
              <td class="v-data-table__mobile-row">
                <div class="v-data-table__mobile-row__header">Name</div>
                <div class="v-data-table__mobile-row__cell">
                  {{ item.first_name }} {{ item.last_name }}
                </div>
              </td>
              <td class="v-data-table__mobile-row">
                <div class="v-data-table__mobile-row__header">
                  {{ $t("uiComponents.settings.permissions.table.email") }}
                </div>
                <div class="v-data-table__mobile-row__cell">
                  {{ item.email }}
                </div>
              </td>

              <td class="v-data-table__mobile-row">
                <div class="v-data-table__mobile-row__header">
                  {{ $t("uiComponents.settings.permissions.table.role") }}
                </div>
                <div class="v-data-table__mobile-row__cell">
                  {{ item.role }}
                </div>
              </td>

              <td class="v-data-table__mobile-row">
                <div class="v-data-table__mobile-row__header">
                  {{ $t("uiComponents.settings.permissions.table.actions") }}
                </div>
                <div class="v-data-table__mobile-row__cell">
                  <CoreButton
                    :disabled="item.id === user.id"
                    button-type="standardIcon"
                    @click="deleteMember(item)"
                  >
                    <lynus-icon name="trash" size="20" />
                  </CoreButton>
                  <FormModal :form-title="$t('uiComponents.settings.permissions.formTitle')">
                    <template #activator>
                      <CoreButton button-type="standardIcon">
                        <div>
                          <lynus-icon name="settings" size="20" />
                        </div>
                      </CoreButton>
                    </template>
                    <template #content>
                      <ManagePermissionsForm :user="item" />
                    </template>
                  </FormModal>
                </div>
              </td>
            </tr>
          </template>
        </CoreDataTable>
      </div>
      <div>
        <InviteMember />
      </div>
    </div>
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import InviteMember from "../../modals/InviteMember/index.vue";
import api from "@/store/api";
import { IMember } from "@/store/modules/members/types";
import { RootState } from "@/store/types";
import ManagePermissionsForm from "@/ui/components/forms/Permissions/ManagePermissions.vue";
import FormModal from "@/ui/components/modals/FormModal.vue";

/**
 * Permissions view is responsible for managing users and their
 * permissions. It uses the members api
 */
export default defineComponent({
  components: {
    ManagePermissionsForm,
    FormModal,
    InviteMember,
  },
  data() {
    const items: IMember[] = [];
    const model: string | null = null;

    return {
      admin: false,
      model,
      search: "",
      items,
      loading: false,
    };
  },
  computed: {
    appState() {
      return (this.$store.state as RootState).app;
    },
    headers() {
      return [
        {
          title: this.$t("uiComponents.settings.permissions.table.name"),
          value: "name",
        },
        {
          title: this.$t("uiComponents.settings.permissions.table.email"),
          value: "email",
        },
        {
          title: this.$t("uiComponents.settings.permissions.table.role"),
          value: "role",
        },
        {
          title: this.$t("uiComponents.settings.permissions.table.actions"),
          value: "actions",
          sortable: false,
        },
      ];
    },
    user() {
      return this.appState.user;
    },
    currentMember() {
      return this.members.find((m) => m.id === this.user.id);
    },
    /**
     * Removes owner from members list
     * @return {array} members list
     */
    sortedByOwner() {
      const ownerInx = this.members.findIndex((member: any) => member.id === this.user.id);
      const members = JSON.parse(JSON.stringify(this.members));
      const owner = members.splice(ownerInx, 1)[0];
      members.unshift(owner);
      return members;
    },
    members(): IMember[] {
      return this.$store.getters["members/members"];
    },
  },
  watch: {
    model: [
      {
        handler: "onSelected",
      },
    ],
    search: [
      {
        handler: "fetchUsers",
      },
    ],
  },
  created() {
    const member = this.members.find((m) => m.id === this.user.id);
    if (!member) return;

    this.admin = member.admin;
  },
  methods: {
    /**
     * clear items @blur, otherwise it will still show
     * the old result when focusing the autocomplete */
    clearItems() {
      this.items = [];
      this.search = "";
    },
    /**
     * Validates email
     * @param {string} s email
     */
    isEmailValid(s: string): boolean {
      // https://stackoverflow.com/a/574698
      if (s.length < 3 || s.length > 254) return false;

      const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(s.toLowerCase());
    },
    onSelected() {
      if (this.model === null) return;

      this.createMember(this.model).finally(() => {
        // clear the autocomplete
        this.model = null;
        this.items = [];
        this.search = "";
      });
    },
    fetchUsers(val?: string) {
      if (this.loading || val == null) return;
      if (!this.isEmailValid(val)) {
        this.items = [];
        return;
      }

      this.loading = true;
      api
        .fetch(`/users?email=${val}`, "GET")
        .then((res) => (this.items = res))
        .finally(() => (this.loading = false));
    },
    createMember(m: string): Promise<Promise<IMember>> {
      return this.$store.dispatch("members/createMember", m);
    },
    deleteMember(m: IMember): Promise<Promise<IMember>> {
      return this.$store.dispatch("members/deleteMember", m);
    },
  },
});
</script>

<style lang="scss">
.permissions-settings {
  .permissions-settings-title {
    font-size: 20px;
    line-height: 1;
  }

  .permissions-settings-content {
    .user-search-wrapper {
      margin-top: 20px;
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
        height: 60px !important;
        color: rgb(var(--v-theme-lynusText)) !important;
      }
    }
  }
}
</style>
