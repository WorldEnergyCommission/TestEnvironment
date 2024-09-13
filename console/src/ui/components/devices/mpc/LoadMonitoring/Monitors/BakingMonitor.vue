<template>
  <LoadMonitor :is-preview="false" :device-data="deviceData" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";

import LoadMonitor from "../LoadMonitor.vue";
import { IDevice } from "@/store/modules/devices/types";
import { RootState } from "@/store/types";

// Properties
interface Props {
  deviceData: IDevice;
}

const props = defineProps<Props>();
</script>
<style lang="scss"></style>
