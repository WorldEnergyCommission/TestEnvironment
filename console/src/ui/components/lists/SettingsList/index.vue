<template>
  <div>
    <!-- settings tab -->
    <CoreContainer class="settings-list pa-0" fluid>
      <CoreRow class="row">
        <CoreTabs show-arrows>
          <CoreTab
            v-for="(item, index) in settingsFiltered"
            :key="index"
            :class="[{ 'settings-card__active': item.isActive }, 'settings-card']"
            @click="handleSettingsCard(item, !item.isActive)"
          >
            <lynus-icon
              :name="item.icon"
              :color="item.isActive ? 'on-accent' : 'lynusText'"
              size="17"
            />
            <div class="settings-card-title">
              {{ $t(item.locale) }}
            </div>
          </CoreTab>
        </CoreTabs>
      </CoreRow>
    </CoreContainer>
    <!-- settings tab view -->
    <div style="padding-top: 20px">
      <component :is="detailBox" v-if="detailBox.length" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

import { envProjectSettingsEntries } from "@/utils/env";

/**
 * Component that shows different settings tabs on settings page
 */
export default defineComponent({
  name: "SettingsList",
  components: {
    General: defineAsyncComponent(() => import("@/ui/components/lists/SettingsList/General.vue")),
    MQTT: defineAsyncComponent(() => import("@/ui/components/lists/SettingsList/MQTT.vue")),
    Permissions: defineAsyncComponent(
      () => import("@/ui/components/lists/SettingsList/Permissions.vue"),
    ),
    Repository: defineAsyncComponent(
      () => import("@/ui/components/lists/SettingsList/Repository.vue"),
    ),
    Notification: defineAsyncComponent(
      () => import("@/ui/components/lists/SettingsList/Notification.vue"),
    ),
    VariablesInSettings: defineAsyncComponent(
      () => import("@/ui/components/lists/SettingsList/Variables.vue"),
    ),
    ElectricityPrice: defineAsyncComponent(
      () => import("@/ui/components/lists/SettingsList/ElectricityPrice.vue"),
    ),
    OperatingHours: defineAsyncComponent(
      () => import("@/ui/components/lists/SettingsList/OperatingHours.vue"),
    ),
  },
  data() {
    return {
      detailBox: "General",
      settings: [
        {
          title: "General",
          locale: "uiComponents.settings.settingsTabs.general",
          component: "General",
          icon: "settings",
          isActive: true,
          requiresOnePermissionOf: [],
        },
        {
          title: "Notification",
          locale: "uiComponents.settings.settingsTabs.notification",
          component: "Notification",
          icon: "notification",
          isActive: false,
          requiresOnePermissionOf: ["writeProject"],
        },
        {
          title: "MQTT",
          locale: "uiComponents.settings.settingsTabs.mqtt",
          component: "MQTT",
          icon: "mqtt",
          isActive: false,
          requiresOnePermissionOf: ["readMQTTSecret"],
        },
        {
          title: "Permissions",
          locale: "uiComponents.settings.settingsTabs.permissions",
          component: "Permissions",
          icon: "permission",
          isActive: false,
          requiresOnePermissionOf: ["writeMember"],
        },
        {
          title: "Variables",
          locale: "uiComponents.settings.settingsTabs.variables",
          component: "VariablesInSettings",
          icon: "variables",
          isActive: false,
          requiresOnePermissionOf: [],
        },
        {
          title: "ElectricityPrice",
          locale: "uiComponents.settings.settingsTabs.electricity_price",
          component: "ElectricityPrice",
          icon: "fa-hand-holding-dollar",
          isActive: false,
          requiresOnePermissionOf: ["writeProject"],
        },
        {
          title: "OperatingHours",
          locale: "uiComponents.settings.settingsTabs.operating_hours",
          component: "OperatingHours",
          icon: "fa-clock",
          isActive: false,
          requiresOnePermissionOf: ["writeProject"],
        },
      ],
    };
  },
  computed: {
    settingsFiltered() {
      return this.settings.filter(
        (e) =>
          envProjectSettingsEntries.includes(e.title) &&
          (e.requiresOnePermissionOf.some((permission) =>
            this.hasCurrentMemberPermission(permission),
          ) ||
            e.requiresOnePermissionOf.length === 0),
      );
    },
    getActiveSetting() {
      return this.settings.find(({ component }) => component === this.detailBox);
    },
    hasCurrentMemberPermission(): (permission: string) => boolean {
      return this.$store.getters["members/hasPermission"];
    },
  },
  methods: {
    /**
     * Switches settings tabs
     * @param {object} card current settings tab
     * @param {boolean} payload status of settings tab
     */
    handleSettingsCard(card: any, payload: boolean) {
      if (payload) {
        this.settings.forEach((item) => (item.isActive = false));
        card.isActive = payload;
        this.detailBox = card.component;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.settings-list {
  .row {
    margin-bottom: 12px;
    margin-top: -12px;
  }

  .settings-card {
    .settings-card-title {
      padding: 0 0 0 5px;
      color: rgb(var(--v-theme-lynusText));
    }

    &__active {
      opacity: 1;
      background: rgb(var(--v-theme-accent));
      .settings-card-title {
        color: rgb(var(--v-theme-on-accent));
      }
    }
  }
}
</style>
