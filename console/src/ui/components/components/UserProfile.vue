<template>
  <CoreMenu>
    <template #activator="{ props }">
      <!-- see https://vuejs.org/guide/components/slots.html#scoped-slots -->
      <slot :display-name="`${user.first_name} ${user.last_name}`" :props="props">
        <CoreCard max-width="250">
          <CoreListItem>
            <CoreListItemTitle v-if="!hideNameWhenEqual" class="lynusText--text">
              <span>{{ user.first_name }} {{ user.last_name }}</span>
            </CoreListItemTitle>
            <lynus-icon name="avatar" size="35" />
          </CoreListItem>
        </CoreCard>
      </slot>
    </template>

    <CoreList>
      <CoreListItem v-for="(item, index) in items" :key="index" :to="item.route">
        <CoreListItemTitle>{{ $t(`uiComponents.userProfile.${item.title}`) }} </CoreListItemTitle>
      </CoreListItem>
      <CoreListItem @click="handleLogout">
        <CoreListItemTitle>{{ $t("uiComponents.userProfile.logout") }} </CoreListItemTitle>
      </CoreListItem>
    </CoreList>
  </CoreMenu>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { RootState } from "@/store/types";
import { Auth } from "@/utils/Auth";
/**
 * Component that represent UserProfile
 * Shows list of user actions. Logout, User keycloak settings
 */
export default defineComponent({
  props: {
    offsetY: { default: true, type: Boolean },
    offsetX: { default: false, type: Boolean },
  },
  data() {
    return {
      items: [{ title: "edit", route: "/profile" }],
    };
  },
  computed: {
    appState() {
      return (this.$store.state as RootState).app;
    },
    hideNameWhenEqual() {
      return this.$vuetify.display.width < 1600;
    },
    user() {
      return this.appState.user;
    },
    initials() {
      return (
        this.user.first_name.charAt(0).toUpperCase() + this.user.last_name.charAt(0).toUpperCase()
      );
    },
  },
  methods: {
    /**
     * Logout from project
     */
    async handleLogout() {
      Auth.Logout();
    },
  },
});
</script>
