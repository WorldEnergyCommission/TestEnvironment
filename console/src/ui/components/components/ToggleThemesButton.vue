<template>
  <CoreListItem class="navigation-list-item" @click="handleTheme">
    <template #prepend>
      <lynus-icon :size="iconSize" color="accent" name="darkmode" />
    </template>

    <CoreListItemTitle>
      {{
        !$vuetify.theme.current.dark
          ? $t("uiComponents.toggleThemesButton.dark")
          : $t("uiComponents.toggleThemesButton.light")
      }}
    </CoreListItemTitle>
  </CoreListItem>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useTheme } from "vuetify";

import { RootState } from "@/store/types";

/**
 * Component that represent ToggleThemesButton
 * Toggle light and dark themes
 */
export default defineComponent({
  props: {
    iconSize: {
      default: 16,
      type: Number,
    },
  },
  data() {
    return {
      theme: useTheme(),
    };
  },
  computed: {
    appState() {
      return (this.$store.state as RootState).app;
    },
    user() {
      return this.appState.user;
    },
  },
  mounted() {
    this.loadTheme();
  },
  methods: {
    /**
     * Saves current theme id in browser local storage
     */
    saveTheme() {
      const currentLynusTheme: any = localStorage.getItem("lynusTheme");
      const theme = this.$vuetify.theme.current.dark ? "dark" : "light";
      const obj = { [this.user.id]: theme };
      const res = currentLynusTheme ? { ...JSON.parse(currentLynusTheme), ...obj } : { ...obj };
      localStorage.setItem("lynusTheme", JSON.stringify(res));
    },
    /**
     * Loads current theme id from browser local storage
     */
    loadTheme() {
      const currentLynusTheme: any = localStorage.getItem("lynusTheme");
      if (currentLynusTheme) {
        const old = JSON.parse(currentLynusTheme)[this.user.id];
        if (old) {
          (this.theme.global.name as string) = old === "dark" ? "dark" : "light";
        }
      }
    },
    handleTheme() {
      (this.theme.global.name as string) = this.$vuetify.theme.current.dark ? "light" : "dark";
      this.saveTheme();
    },
  },
});
</script>
