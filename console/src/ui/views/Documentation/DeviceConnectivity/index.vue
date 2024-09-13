<template>
  <CoreCard class="device-connectivity">
    <div v-if="isCurrentRoute" class="topic-wrapper">
      <div v-for="(item, index) in downloadsChips" :key="index" class="topic">
        <div class="topic-title">
          {{
            $t(`uiComponents.documentation.deviceConnectivity.downloadsChips.topics.${item.topic}`)
          }}
        </div>
        <div v-for="(chip, chipInx) in item.chips" :key="chipInx" class="topic-content">
          <CoreButton v-if="chip.isChip" :href="chip.source" download button-type="primary">
            <template #icon>
              <CoreIcon>fas fa-download</CoreIcon>
            </template>
            {{
              $t(`uiComponents.documentation.deviceConnectivity.downloadsChips.chips.${chip.title}`)
            }}
          </CoreButton>
          <CoreButton v-else :to="chip.source" button-type="primary">
            <template #icon>
              <CoreIcon>fas fa-arrow-right</CoreIcon>
            </template>
            {{
              $t(`uiComponents.documentation.deviceConnectivity.downloadsChips.chips.${chip.title}`)
            }}
          </CoreButton>
        </div>
      </div>
    </div>
    <router-view />
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * Component where you can download descriptions, documentations
 */
export default defineComponent({
  name: "DeviceConnectivity",
  data() {
    return {
      downloadsChips: [
        {
          topic: "softwarePackageForBeckhoff",
          chips: [
            {
              isChip: true,
              title: "controllersV2",
              source:
                "./files/Dokumentation_zur_Benutzung_des_Lynus_Softwarepaketes_für_die_Beckhoff.pdf",
              linkAttr: "href",
              isLoaded: false,
            },
            {
              isChip: false,
              title: "tcpEdgeDevice",
              source: "/documentation/deviceConnectivity/edgeDevice",
              linkAttr: "to",
              isLoaded: false,
            },
          ],
        },
        {
          topic: "interfaceLynus",
          chips: [
            {
              isChip: true,
              title: "interfaceDescriptionLynus",
              source: "./files/Schnittstellenbeschreibung Lynus.pdf",
              linkAttr: "href",
              isLoaded: false,
            },
          ],
        },
      ],
    };
  },
  computed: {
    isCurrentRoute() {
      return this.$route.name === "DeviceConnectivity";
    },
  },
});
</script>

<style lang="scss" scoped>
.device-connectivity {
  a {
    color: #2196f3;
  }

  .topic-wrapper {
    padding: 0 0 20px 0;
    overflow-x: auto;

    .topic {
      .topic-title {
        padding-top: 20px;
        font-size: 20px;
      }

      .topic-content {
        padding-top: 10px;
      }
    }
  }
}
</style>
