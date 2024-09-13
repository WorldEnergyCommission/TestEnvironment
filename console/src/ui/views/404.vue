<template>
  <div class="error-page bg-surface">
    <CoreContainer fluid>
      <CoreRow>
        <CoreColumn cols="12">
          <div class="logo">
            <CoreImage :src="getLogo" class="logo-image" />
          </div>
          <div class="text-section">
            <p class="header">{{ t("uiComponents.notFound.oops") }}</p>
            <p class="subheader">{{ t("uiComponents.notFound.404") }}</p>
            <p>{{ t("uiComponents.notFound.sorry") }}</p>
            <p>{{ t("uiComponents.notFound.contact") }}</p>
          </div>
          <div class="d-flex justify-center">
            <CoreButton button-type="secondary" @click="$router.push({ name: 'Home' })">
              {{ t("uiComponents.notFound.homePage") }}
            </CoreButton>
          </div>
        </CoreColumn>
        <CoreColumn />
      </CoreRow>
    </CoreContainer>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTheme } from "vuetify/lib/framework.mjs";

import { loginLogoDark, loginLogo } from "@/utils/env";

const { current: theme } = useTheme();

const { t } = useI18n();

const getLogo = computed(() => {
  const isDark = theme.value.dark;
  return isDark ? loginLogoDark : loginLogo;
});
</script>

<style lang="scss" scoped>
.error-page {
  min-height: 100%;

  .text-section {
    text-align: center;
    margin: 60px 0;
    color: rgb(var(--v-theme-lynusText));
  }
}

.logo-image {
  height: 30px;
}

.header {
  font-size: 90px;
  font-weight: 900;
  color: rgb(var(--v-theme-accent));
}

.subheader {
  font-weight: 900;
  font-size: 20px;
  margin-top: 30px;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.text {
  font-size: 18px;
}
</style>
