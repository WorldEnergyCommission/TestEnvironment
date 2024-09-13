<template>
  <CoreCard v-if="!loading" class="settings-list-mqtt mqtt-settings">
    <div class="mqtt-settings-title">
      {{ $t("uiComponents.settings.mqtt.title") }}
    </div>
    <div class="content">
      <CoreForm class="mqtt-settings-form">
        <CoreTextField
          v-for="(value, key) in mqttInfo"
          :key="key"
          v-clipboard
          :label="key.toString()"
          :style="{ 'max-width': '600px' }"
          :model-value="value"
          class="mqtt-settings-form-field"
          hide-details
          readonly
        />
      </CoreForm>
    </div>
    <Downloads class="mt-3" />
    <div class="mqtt-settings-footer">
      {{ $t("uiComponents.settings.mqtt.info") }} {{ shownSupportMail }}
    </div>
  </CoreCard>
  <CircleSpinner
    v-else
    :size="80"
    color="accent"
    style="position: absolute; left: 50%; top: 50%; transform: translateY(-50%) translateX(-50%)"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import api from "@/store/api";
import { RootState } from "@/store/types";
import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import Downloads from "@/ui/components/lists/SettingsList/Downloads.vue";
import { envMqtt, envSettingsMailSupport } from "@/utils/env";

/**
 * Component that shows MQTT info settings tab
 */
export default defineComponent({
  components: {
    Downloads,
    CircleSpinner,
  },
  data() {
    return {
      shownSupportMail: envSettingsMailSupport,
      loading: true,
      secret: "",
    };
  },
  computed: {
    projectsState() {
      return (this.$store.state as RootState).projects;
    },
    /**
     * Getter return data from MQTT client for Settings/MQTT information page
     */
    mqttInfo() {
      const username = this.projectsState.projectId;
      const password = this.secret;
      const hostname = envMqtt;
      return {
        username,
        password,
        port: "8883",
        hostname,
        topicPublish: `projects/${this.projectsState.projectId}/messages`,
        topicSubscribe: `projects/${this.projectsState.projectId}/messages2`,
      };
    },
  },
  created() {
    this.fetchSecret();
  },
  methods: {
    async fetchSecret() {
      try {
        this.loading = true;
        const response = await api.fetch(
          `/projects/${this.projectsState.projectId}/mqtt-secret`,
          "GET",
        );
        this.secret = response;
      } catch (e: any) {
        this.setReport({
          type: "error",
          message: e?.message,
          value: true,
        });
      } finally {
        this.loading = false;
      }
    },
    setReport(payload: any) {
      this.$store.commit("app/setReport", payload);
    },
  },
});
</script>

<style lang="scss" scoped>
.mqtt-settings {
  .mqtt-settings-title {
    font-size: 20px;
    line-height: 1;
  }

  .content {
    .mqtt-settings-form {
      .mqtt-settings-form-field {
        margin-top: 20px;
      }
    }
  }

  .mqtt-settings-footer {
    margin-top: 15px;

    a {
      color: rgb(var(--v-theme-accent));
      text-decoration: none;
    }
  }
}
</style>
