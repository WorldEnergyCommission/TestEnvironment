<template>
  <EfficientIODialog :dialog-title="$t('permissions.invite.title')">
    <template #activator>
      <CoreButton
        button-type="primary"
        :icon="$vuetify.display.xsOnly"
        icon-name="plus"
        :icon-size="iconSize"
      >
        <span v-if="!$vuetify.display.xsOnly">
          {{ $t("permissions.invite.title") }}
        </span>
      </CoreButton>
    </template>
    <template #content="{ hide, isActive }">
      <InviteForm v-if="isActive" @dismiss="() => hide()" />
    </template>
  </EfficientIODialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import InviteForm from "./Form.vue";
import { IProjectsState } from "@/store/modules/projects/types";
import { RootState } from "@/store/types";
import EfficientIODialog from "@/ui/components/modals/EfficientIODialog.vue";

/**
 * Permissions view is responsible for managing users and their
 * permissions. It uses the members api
 */
export default defineComponent({
  name: "InviteMember",
  components: {
    EfficientIODialog,
    InviteForm,
  },
  data() {
    return {
      email: "",
    };
  },
  computed: {
    projectsState() {
      return (this.$store.state as RootState).projects;
    },
    iconSize() {
      switch (this.$vuetify.display.name) {
        case "xs":
          return 20;
        case "sm":
          return 13;
        case "md":
          return 18;
        case "lg":
          return 20;
        case "xl":
          return 20;
        default:
          return 20;
      }
    },
  },
  methods: {
    setReport(payload: any) {
      this.$store.commit("app/setReport", payload);
    },
  },
});
</script>
