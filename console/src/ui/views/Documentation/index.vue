<template>
  <div class="documentation-view pa-5 curved-display-padding-bottom bottom-without-safe">
    <CoreCard class="documentation-view-header">
      <div class="breadcrumbs-wrapper">
        <Breadcrumbs />
      </div>
      <div v-if="!currentRoute" class="documentation-view-description">
        {{ $t("uiComponents.documentation.welcomeText") }}
      </div>
      <div v-if="!currentRoute">SHA: {{ sha }}</div>
    </CoreCard>
    <CoreContainer v-if="!currentRoute" class="pa-0 documentation-tabs" fluid>
      <CoreRow>
        <CoreColumn
          v-for="(item, index) in documentationNavigationFiltered"
          :key="index"
          lg="4"
          md="6"
          sm="12"
          xs="12"
        >
          <CoreCard :to="item.path" class="tab-item align-center justify-space-between" link>
            <div class="tab-title">
              {{ $t(item.locale) }}
            </div>
            <CoreIcon color="theme" size="small" class="ml-auto"> fas fa-arrow-right </CoreIcon>
          </CoreCard>
        </CoreColumn>
      </CoreRow>
    </CoreContainer>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Breadcrumbs from "@/ui/components/components/Breadcrumbs.vue";
import { getLatestSha } from "@/utils/utilsFunctions";

export default defineComponent({
  components: {
    Breadcrumbs,
  },
  computed: {
    currentRoute() {
      return this.$route.meta?.documentationView ?? false;
    },
    sha() {
      return getLatestSha();
    },
    documentationNavigationFiltered(): any {
      return this.$store.getters["navigation/documentationNavigationFiltered"];
    },
  },
});
</script>

<style lang="scss" scoped>
@import "./src/ui/scss/variables";

.documentation-view {
  .documentation-view-header {
    .documentation-view-description {
      padding-top: 20px;
    }
  }

  .documentation-tabs {
    padding-top: 20px !important;

    .tab-item {
      border-radius: $border-radius-root;
      height: 35px;
      display: flex;
      align-content: center;
      padding: 0 15px;
      border: solid 1px rgb(var(--v-theme-accent)) !important;
      background-color: rgb(var(--v-theme-surface)) !important;

      .tab-title {
        color: rgb(var(--v-theme-lynusText));
      }
    }
  }
}
</style>
