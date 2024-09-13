<template>
  <CoreRow>
    <CoreColumn cols="12">
      <h2>{{ $t("uiComponents.settings.permissions.addPermission") }}</h2>
    </CoreColumn>
    <CoreColumn cols="12">
      <CoreSelect
        v-model="selectedGroup"
        :items="permissionGroups"
        :label="$t('uiComponents.settings.permissions.group')"
        density="compact"
        hide-details
        hide-selected
        :disabled="isAdmin"
      />
    </CoreColumn>
    <CoreColumn cols="12">
      <CoreAutocomplete
        v-model="selectedPermissions"
        :items="additionalPermissions"
        item-value="id"
        item-title="text"
        :label="$t('uiComponents.settings.permissions.newPermission')"
        hide-details
        hide-selected
        multiple
        clearable
        chips
        closable-chips
        :disabled="isAdditionalPermissionSelectDisabled"
      >
        <template #chip="{ props, item }">
          <CoreChip
            v-bind="props"
            closable
            variant="outlined"
            :text="item.value"
            color="accent"
            class="pa-3"
          />
        </template>
      </CoreAutocomplete>
    </CoreColumn>
    <CoreColumn cols="12">
      <CoreAutocomplete
        v-model="selectedScopes"
        :items="possibleScopes"
        item-value="id"
        :label="$t('uiComponents.settings.permissions.scope')"
        chips
        closable-chips
        hide-details
        hide-selected
        multiple
        clearable
        :disabled="isAdditionalScopeSelectDisabled"
        :loading="loadingPossiblePermissions"
      >
        <template #item="{ props, item }">
          <CoreListItem v-bind="props" :title="item?.raw?.name" :subtitle="item?.raw?.id" />
        </template>
        <template #chip="{ props, item }">
          <CoreChip
            v-bind="props"
            closable
            variant="outlined"
            :text="item?.raw?.name"
            color="accent"
            class="pa-3"
          />
        </template>
      </CoreAutocomplete>
    </CoreColumn>
    <CoreColumn v-if="selectedScopesErrors.length" cols="12">
      <CoreAlert color="yellow" density="compact" variant="tonal" type="warning" class="mb-0">
        {{ selectedScopesErrors }}
      </CoreAlert>
    </CoreColumn>
    <CoreColumn cols="12" class="d-flex">
      <CoreCheckbox v-model="wildcard" :label="`Wildcard`" class="mt-0" />
      <CoreButton
        class="ml-auto"
        :disabled="isSaveDisabled"
        button-type="primary"
        @click="addPermissions"
      >
        {{ $t("uiComponents.buttons.save") }}
      </CoreButton>
    </CoreColumn>
  </CoreRow>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import { IMember } from "@/store/modules/members/types";
import { IMLModel } from "@/store/modules/mpc/types";
import { IPermission, IPossiblePermissionScope } from "@/store/modules/permissions/types";
import { RootState } from "@/store/types";
import { isCustomLib } from "@/utils/utilsFunctions";

export default defineComponent({
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
  data() {
    const possibleScopes: IPossiblePermissionScope[] = [];
    const selectedPermissions: string[] = [];
    const selectedScopes: string[] = [];

    return {
      isCustomLib: isCustomLib,
      selectedScopes,
      selectedPermissions,
      selectedGroup: "",
      loadingPossiblePermissions: false,
      wildcard: false,
      possibleScopes,
    };
  },
  computed: {
    reportState() {
      return (this.$store.state as RootState).report;
    },
    permissionState() {
      return (this.$store.state as RootState).permissions;
    },
    /** get possible new scopes with headers and dividers for autocomplete */
    permissionGroups() {
      return this.permissionState.groups.map((group) => {
        return {
          title: this.$t(`permissions.groups.${group}`),
          value: group,
        };
      });
    },
    /** get all possible additional permissions */
    additionalPermissions() {
      return this.permissions
        .filter((permission) => {
          return (
            !this.memberPermission(this.user.id)
              .filter((uPermission) => uPermission.scope === "*")
              .map((uPermission) => uPermission.id)
              .includes(permission.id) && permission.group === this.selectedGroup
          );
        })
        .map((permission) => permission.id);
    },
    isAdditionalPermissionSelectDisabled() {
      return this.selectedGroup === "" || this.isAdmin;
    },
    isAdditionalScopeSelectDisabled() {
      return (
        this.selectedPermissions.length === 0 ||
        this.isAdmin ||
        this.wildcard ||
        this.hasAnySelectedPermissionWithoutScope
      );
    },
    hasAnySelectedPermissionWithoutScope() {
      return (
        this.permissions
          .filter((permission) => permission.without_scope)
          .filter((permission) => this.selectedPermissions.includes(permission.id)).length > 0
      );
    },
    selectedScopesErrors() {
      if (this.requiredPermissions.length > 0) {
        const message =
          this.selectedPermissions.length <= 1
            ? this.$t("permissions.requiresFollowingPermission")
            : this.$t("permissions.requiresFollowingMultiplePermission");
        return `${message} ${this.requiredPermissions.join(", ")}`;
      }

      return [];
    },
    isAdmin() {
      return this.user.role === "projectAdmin";
    },
    isSaveDisabled() {
      return (
        this.isAdditionalPermissionSelectDisabled ||
        this.selectedPermissions.length === 0 ||
        this.isAdmin ||
        (this.selectedScopes.length === 0 && !this.wildcard)
      );
    },
    requiredPermissions() {
      return this.permissions
        .filter((permission) => this.selectedPermissions.includes(permission.id))
        .map((permission) => permission.dependent_on ?? [])
        .flat()
        .filter(
          (permission) =>
            !this.memberPermission(this.user.id)
              .filter((uPermission) => uPermission.scope === "*")
              .map((uPermission) => uPermission.id)
              .includes(permission),
        );
    },
    mpcControllers(): IMLModel[] {
      return this.$store.getters["mpc/mpcControllers"];
    },
    devices(): IDevice[] {
      return this.$store.getters["devices/allDevices"];
    },
    memberPermission(): (memberId: string) => IPermission[] {
      return this.$store.getters["permissions/permissionsForMember"];
    },
    permissions(): IPermission[] {
      return this.$store.getters["permissions/permissions"];
    },
  },
  watch: {
    selectedPermissions: [
      {
        handler: "needPossiblePermissionFetching",
      },
    ],
    selectedGroup: [
      {
        handler: "resetSelectPermissions",
      },
    ],
  },
  created() {
    this.fetchPermissions();
    this.fetchDevices();
    this.fetchReports();
    this.fetchPermissionGroups();
  },
  methods: {
    /** remove a selcted scope */
    removeScope(item: { id: string }) {
      const index = this.selectedScopes.indexOf(item.id);
      if (index >= 0) this.selectedScopes.splice(index, 1);
    },
    /** remove a selected permission */
    removePermission(item: string) {
      const index = this.selectedPermissions.indexOf(item);
      if (index >= 0) this.selectedPermissions.splice(index, 1);
    },
    addPermissions() {
      if (this.isSaveDisabled) return;
      this.createPermssions({
        memberId: this.user.id,
        permissions: this.requiredPermissions,
        scopes: [],
        wildcard: true,
      }).then(() =>
        this.createPermssions({
          memberId: this.user.id,
          permissions: this.selectedPermissions,
          scopes: this.selectedScopes,
          wildcard: this.wildcard,
        }).then(() => (this.selectedGroup = "")),
      );
    },
    async needPossiblePermissionFetching() {
      if (this.isAdditionalScopeSelectDisabled) return;

      this.loadingPossiblePermissions = true;
      await this.fetchPossiblePermissionScopes(this.selectedPermissions[0]);
      this.loadingPossiblePermissions = false;
      const filteredPermissionScopes = this.memberPermission(this.user.id)
        .filter((uPermission) => this.selectedPermissions.includes(uPermission.id))
        .map((uPermission) => uPermission.scope_reference);
      this.possibleScopes = this.permissionState.possiblePermisssions.filter((possibleScope) => {
        return !filteredPermissionScopes.includes(possibleScope.id);
      });
    },
    /** reset state of selects when selected group changes
     * makes it possible to reset selectedGroup to reset complete state
     **/
    resetSelectPermissions() {
      this.selectedPermissions = [];
      this.selectedScopes = [];
    },
    fetchDevices(): Promise<Promise<void>> {
      return this.$store.dispatch("devices/fetchDevices");
    },
    fetchReports(): Promise<Promise<void>> {
      return this.$store.dispatch("report/fetchReports");
    },
    fetchPermissions(): Promise<Promise<void>> {
      return this.$store.dispatch("permissions/fetchPermissions");
    },
    fetchPermissionGroups(): Promise<Promise<void>> {
      return this.$store.dispatch("permissions/fetchPermissionGroups");
    },
    createPermssions(toCreate: {
      memberId: string;
      permissions: string[];
      scopes: string[];
      wildcard: boolean;
    }): Promise<Promise<IPermission[]>> {
      return this.$store.dispatch("permissions/createPermissionsForMember", toCreate);
    },
    fetchPossiblePermissionScopes(permissionId: string): Promise<Promise<void>> {
      return this.$store.dispatch("permissions/fetchPossiblePermissionScopes", permissionId);
    },
  },
});
</script>
