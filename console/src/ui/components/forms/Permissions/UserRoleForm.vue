<template>
  <CoreRow>
    <CoreColumn cols="12">
      <h2>{{ $t("uiComponents.settings.permissions.user") }}</h2>
    </CoreColumn>
    <CoreColumn cols="12">
      <CoreTextField
        :model-value="` ${user.first_name} ${user.last_name}`"
        :label="$t('uiComponents.settings.permissions.table.name')"
        readonly
        disabled
        hide-details
      />
    </CoreColumn>
    <CoreColumn cols="12">
      <CoreTextField
        :model-value="user.email"
        :label="$t('uiComponents.settings.permissions.table.email')"
        Email
        readonly
        disabled
        hide-details
      />
    </CoreColumn>
    <!-- Select overall project role -->
    <CoreColumn cols="12">
      <CoreSelect
        v-model="selectedRole"
        :items="roles"
        :label="$t('uiComponents.settings.permissions.table.role')"
        density="compact"
        :disabled="user.id === currentUser.id"
        hide-details
        hide-selected
      />
    </CoreColumn>
    <!-- Select overall project role -->
    <CoreColumn cols="12" class="d-flex">
      <CoreButton
        class="ml-auto"
        :disabled="saveRoleButtonDisabled"
        button-type="primary"
        @click="updateRole"
      >
        {{ $t("uiComponents.buttons.save") }}
      </CoreButton>
    </CoreColumn>
  </CoreRow>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";

import { IUser } from "@/store/modules/app/types";
import { IMember } from "@/store/modules/members/types";

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
    return {
      selectedRole: "",
    };
  },
  computed: {
    // TODO: use store and maybe even fetch from api
    roles() {
      return [
        {
          title: this.$t("uiComponents.settings.permissions.roles.projectAdmin"),
          value: "projectAdmin",
        },
        {
          title: this.$t("uiComponents.settings.permissions.roles.projectUser"),
          value: "projectUser",
        },
        {
          title: this.$t("uiComponents.settings.permissions.roles.restrictedProjectUser"),
          value: "restrictedProjectUser",
        },
      ];
    },
    saveRoleButtonDisabled() {
      return this.selectedRole === this.user.role || this.selectedRole === "";
    },
    currentUser(): IUser {
      return this.$store.getters["app/getUser"];
    },
  },
  created() {
    this.selectedRole = this.user.role;
  },
  methods: {
    updateRole() {
      const memberToUpdate = { ...this.user };
      memberToUpdate.role = this.selectedRole;
      this.updateMember(memberToUpdate);
    },
    updateMember(member: IMember): Promise<Promise<IMember>> {
      return this.$store.dispatch("members/updateMember", member);
    },
  },
});
</script>
