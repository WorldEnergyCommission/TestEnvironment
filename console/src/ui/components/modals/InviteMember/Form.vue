<template>
  <form action="javascript:void(0);">
    <CoreTextField v-model="email" :label="$t('uiComponents.settings.permissions.table.email')" />
    <div class="d-flex align-end">
      <CoreButton class="ml-auto" button-type="secondary" @click="$emit('dismiss')">
        {{ $t("uiComponents.buttons.cancel") }}
      </CoreButton>
      <CoreButton
        class="ml-3"
        button-type="primary"
        :loading="loading"
        type="submit"
        @click="sendInvite()"
      >
        {{ $t("uiComponents.buttons.submit") }}
        <template #iconRight>
          <CoreIcon v-if="!loading" size="15"> far fa-paper-plane </CoreIcon>
        </template>
      </CoreButton>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import api from "@/store/api";
import { RootState } from "@/store/types";

/**
 * Permissions view is responsible for managing users and their
 * permissions. It uses the members api
 */
export default defineComponent({
  data() {
    return {
      email: "",
      loading: false,
    };
  },
  computed: {
    projectsState() {
      return (this.$store.state as RootState).projects;
    },
  },
  methods: {
    async sendInvite() {
      try {
        this.loading = true;
        const response = await api.fetch(
          `/projects/${this.projectsState.projectId}/members/invite`,
          "POST",
          { email: this.email },
        );

        this.$emit("dismiss");
        this.setReport({
          type: "success",
          message: this.$t("permissions.invite.success"),
          value: true,
        });

        this.fetchMembers(this.projectsState.projectId!);
      } catch (e: any) {
        this.setReport({
          type: "error",
          message: this.$t("permissions.invite.error"),
          value: true,
        });
      } finally {
        this.loading = false;
      }
    },
    fetchMembers(projectId: string): Promise<Promise<void>> {
      return this.$store.dispatch("members/fetchMembers", projectId);
    },
    setReport(payload: any) {
      this.$store.commit("app/setReport", payload);
    },
  },
});
</script>
