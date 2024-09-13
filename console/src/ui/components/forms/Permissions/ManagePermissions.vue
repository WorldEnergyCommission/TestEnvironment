<template>
  <CoreContainer class="manage-permissions-content">
    <CoreForm>
      <!-- Select overall project role -->
      <CoreRow class="flex-column flex-md-row">
        <CoreColumn>
          <UserRoleForm :user="user" />
        </CoreColumn>
        <CoreDivider vertical inset />
        <!-- add additional permissions -->
        <CoreColumn>
          <AddPermissionForm :user="user" />
        </CoreColumn>
      </CoreRow>
      <!-- display additional permissions -->
      <CoreRow>
        <CoreColumn cols="12">
          <h2>{{ $t("uiComponents.settings.permissions.additionalPermissions") }}</h2>
        </CoreColumn>
        <CoreColumn cols="12">
          <CoreDataTable
            :headers="additionalPermissionsHeaders as any"
            :items="additionalPermissionsOfMember"
            item-key="key"
          >
            <template v-if="$vuetify.display.mobile" #headers />
            <template v-if="$vuetify.display.mobile" #body="{ items }">
              <tr
                v-for="(item, index) in items"
                :key="index"
                class="v-data-table__mobile-table-row"
              >
                <td class="v-data-table__mobile-row">
                  <div class="v-data-table__mobile-row__header">
                    {{ $t("uiComponents.settings.permissions.permission") }}
                  </div>
                  <div class="v-data-table__mobile-row__cell">
                    {{ item.id }}
                  </div>
                </td>
                <td class="v-data-table__mobile-row">
                  <div class="v-data-table__mobile-row__header">
                    {{ $t("uiComponents.settings.permissions.scope") }}
                  </div>
                  <div class="v-data-table__mobile-row__cell">
                    {{ item.scope }}
                  </div>
                </td>

                <td class="v-data-table__mobile-row">
                  <div class="v-data-table__mobile-row__header">
                    {{ $t("uiComponents.settings.permissions.actions") }}
                  </div>
                  <div class="v-data-table__mobile-row__cell">
                    <CoreIcon
                      size="small"
                      class="mr-2"
                      @click="deleteAdditionalPermission(item.id, item.scope_id)"
                    >
                      mdi:mdi-delete
                    </CoreIcon>
                  </div>
                </td>
              </tr>
            </template>

            <template #item.actions="{ internalItem: item }">
              <CoreIcon
                size="small"
                class="mr-2"
                @click="deleteAdditionalPermission(item.raw.id, item.raw.scope_id)"
              >
                mdi:mdi-delete
              </CoreIcon>
            </template>
          </CoreDataTable>
        </CoreColumn>
      </CoreRow>
    </CoreForm>
  </CoreContainer>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import AddPermissionForm from "./AddPermissionForm.vue";
import UserRoleForm from "./UserRoleForm.vue";
import { IMember } from "@/store/modules/members/types";
import { IPermission } from "@/store/modules/permissions/types";

export default defineComponent({
  components: {
    UserRoleForm,
    AddPermissionForm,
  },
  props: {
    user: {
      default: () => ({
        id: "",
        email: "",
        admin: "",
        first_name: "",
        last_name: "",
        owner: false,
        role: "",
      }),
      type: Object as PropType<IMember>,
    },
  },
  computed: {
    additionalPermissionsHeaders() {
      return [
        { title: this.$t("uiComponents.settings.permissions.permission"), key: "id", width: "45%" },
        { title: this.$t("uiComponents.settings.permissions.scope"), key: "scope", width: "45%" },
        {
          title: this.$t("uiComponents.settings.permissions.actions"),
          key: "actions",
          sortable: false,
          align: "end",
        },
      ];
    },
    additionalPermissionsOfMember() {
      return this.memberPermission(this.user.id).map((permission) => {
        return {
          ...permission,
          key: `${permission.id}_${permission.scope_id}`,
        };
      });
    },
    memberPermission(): (memberId: string) => IPermission[] {
      return this.$store.getters["permissions/permissionsForMember"];
    },
  },
  created() {
    this.fetchPermissionsForMember(this.user.id);
  },
  methods: {
    deleteAdditionalPermission(permissionId: string, scopeId: string) {
      this.deletePermssion({
        memberId: this.user.id,
        permission: permissionId,
        scope: scopeId,
      });
    },
    fetchPermissionsForMember(memberId: string): Promise<Promise<void>> {
      return this.$store.dispatch("permissions/fetchPermissionsForMember", memberId);
    },
    deletePermssion(toDelete: {
      memberId: string;
      permission: string;
      scope: string;
    }): Promise<Promise<IPermission[]>> {
      return this.$store.dispatch("permissions/deletePermissionForMember", toDelete);
    },
  },
});
</script>

<style lang="scss" scoped>
@import "./src/ui/scss/variables";

.manage-permissions-content {
  background-color: var(--v-primary-base);
}
</style>
