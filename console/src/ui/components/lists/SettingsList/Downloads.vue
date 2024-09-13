<template>
  <CoreCard class="downloads-settings">
    <div class="downloads-settings-title">
      <div class="d-flex">
        <div class="mr-2 title-item" @click="currentGroup = 'main'">
          {{ $t("uiComponents.settings.downloads.title") }}
        </div>
        <div v-if="currentGroup === 'lynusCommunicator'" class="d-flex">
          <CoreIcon size="15"> fas fa-angle-right </CoreIcon>
          <div class="ml-2 title-item">
            {{ $t("uiComponents.settings.downloads.chipGroups.beckhoffLibraries") }}
          </div>
        </div>
      </div>
    </div>

    <div class="downloads-settings-content">
      <div>
        <div v-for="(item, index) in filteredChips" :key="index" class="source-field">
          <CoreButton :href="item.source" download button-type="primary">
            <template #icon>
              <CoreIcon>fas fa-download</CoreIcon>
            </template>
            {{ $t(item.locale) }}
          </CoreButton>
        </div>
      </div>
    </div>
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import {
  envAppShowProjectTypeSelection,
  envMqttCertFilePostfix,
  envSettingsDownloadList,
} from "@/utils/env";

/**
 * Component that shows downloads settings tab
 */
export default defineComponent({
  data() {
    return {
      showAdditionalDownloads: envAppShowProjectTypeSelection,
      chips: [
        {
          title: "Download Certificate",
          locale: "uiComponents.settings.downloads.chips.certificate",
          value: "Certificate",
          source: `./files/mqtt${envMqttCertFilePostfix}.pem`,
          isLoaded: false,
          group: "main",
        },
        {
          title: "lynusStandarts",
          locale: "uiComponents.settings.downloads.chips.lynusStandarts",
          value: "lynusStandarts",
          source: "./files/Lynus_Standards.compiled-library",
          isLoaded: false,
          group: "lynusCommunicator",
        },
        {
          title: "lynusCommunicator2",
          locale: "uiComponents.settings.downloads.chips.lynusCommunicator2",
          value: "lynusCommunicator2",
          source: "./files/Lynus_Communicator_V2_0.compiled-library",
          isLoaded: false,
          group: "lynusCommunicator",
        },
        {
          title: "lynusPersistentData1",
          locale: "uiComponents.settings.downloads.chips.lynusPersistentData1",
          value: "lynusPersistentData1",
          source: "./files/Lynus_Persistent_Data_V1_0.compiled-library",
          isLoaded: false,
          group: "lynusCommunicator",
        },
      ],
      currentGroup: "main",
    };
  },
  computed: {
    filteredByConfig() {
      return this.chips.filter((e: any) => envSettingsDownloadList.includes(e.value));
    },
    filteredChips() {
      return this.filteredByConfig.filter((el: any) => el.group === this.currentGroup);
    },
  },
});
</script>

<style lang="scss" scoped>
.downloads-settings {
  .downloads-settings-title {
    font-size: 20px;
    line-height: 1;
    @media all and (max-width: 600px) {
      font-size: 16px;
    }

    .title-item {
      cursor: pointer;
    }
  }

  .downloads-settings-content {
    overflow-x: auto;
  }

  .source-field {
    padding-top: 10px;
  }

  .additional-downloads {
    padding: 10px 0;
  }
}
</style>
