<template>
  <div v-if="isTopContent()">
    <!-- MapBanner key used to replace map on theme change -->
    <MapBanner v-if="isTopContentMap()" :key="`${$vuetify.theme.current.dark}`" />

    <iframe
      v-if="!isTopContentMap()"
      :src="getContentUrl()"
      class="home-content-iframe mb-4"
      frameborder="0"
      title="home"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import MapBanner from "./MapBanner.vue";
import { envHomeSiteTopContent } from "@/utils/env";

export default defineComponent({
  components: { MapBanner },
  methods: {
    isTopContentMap() {
      return envHomeSiteTopContent === "MAP";
    },
    isTopContent() {
      return envHomeSiteTopContent !== "NO";
    },
    getContentUrl() {
      return envHomeSiteTopContent;
    },
  },
});
</script>

<style scoped>
.home-content-iframe {
  width: 100%;
  height: 50dvh;
}
</style>
