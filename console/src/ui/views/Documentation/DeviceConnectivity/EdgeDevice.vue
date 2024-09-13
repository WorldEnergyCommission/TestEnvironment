<template>
  <CoreCard class="edge-device">
    <div v-for="(item, index) in downloadsChips" :key="index" class="topic-item">
      <CoreButton :href="item.source" download button-type="primary">
        <template #icon>
          <CoreIcon>fas fa-download</CoreIcon>
        </template>
        {{
          $t(
            `uiComponents.documentation.deviceConnectivity.downloadsChips.edgeDeviceChips.${item.title}`,
          )
        }}
      </CoreButton>
    </div>
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      downloadsChips: [
        {
          title: "modbusTCPEdgeDevice",
          source: "./files/Doku ModbusTCP Edge Device Lynus.pdf",
          isLoaded: false,
        },
        {
          title: "globalVariablesList",
          source: "./files/GVL for Helper TCP.txt",
          isLoaded: false,
        },
        {
          title: "xmlForWinCE",
          source: "./files/TcModbusSrv.xml",
          isLoaded: false,
        },
        {
          title: "xmlForWinUpperWinCE",
          source: "./files/XMLModbusTCPConfig.xml",
          isLoaded: false,
        },
      ],
    };
  },
});
</script>

<style lang="scss" scoped>
.edge-device {
  padding: 10px 0 20px 0;
  overflow-x: auto;

  .topic-item {
    padding-top: 10px;
  }
}
</style>
