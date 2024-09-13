<template>
  <CoreCard class="notifications-settings">
    <div class="notifications-settings-title">
      {{ $t("uiComponents.settings.notification.title") }}
    </div>
    <div style="display: flex">
      <ConChecker style="margin-top: 10px" />
    </div>
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ConChecker from "@/ui/components/lists/SettingsList/components-settings/ConnectivityChecker.vue";

/**
 * Component that shows Notification settings tab
 */
export default defineComponent({
  components: {
    ConChecker,
  },
});
</script>

<style lang="scss" scoped>
.notifications-settings {
  .notifications-settings-title {
    font-size: 20px;
    line-height: 1;
  }
}
</style>
