<template>
  <div class="curved-display-padding-bottom">
    <SettingsList />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import SettingsList from "@/ui/components/lists/SettingsList/index.vue";

/**
 * Page allows you to:
 * set up notifications, permissions, general settings;
 * check MQTT information;
 * upload repositories;
 * download certificates;
 */
export default defineComponent({
  components: {
    SettingsList,
  },
  async created() {
    await this.fetchMembers(this.$route.params.id as string);
  },
  methods: {
    fetchMembers(projectId: string): Promise<Promise<void>> {
      return this.$store.dispatch("members/fetchMembers", projectId);
    },
  },
});
</script>

<style lang="scss" scoped>
.settings {
  .settings-card {
    border: 1px solid transparent;

    &__active {
      border: 1px solid rgb(var(--v-theme-accent)) !important;
    }
  }
}
</style>
