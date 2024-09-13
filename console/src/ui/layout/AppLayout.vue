<template>
  <CoreLayout style="position: unset !important">
    <CoreContainer class="pa-0 ma-0" fluid style="height: 100%">
      <AppDrawer v-model="drawer" />
      <CoreRow class="no-column-wrap curved-display-margin" no-gutters style="height: 100%">
        <CoreColumn style="min-width: 0">
          <CoreRow class="pa-0 ma-0">
            <!-- Top Bar -->
            <AppBar
              v-model="drawer"
              :app-bar-height="appBarHeight"
              :hide-second-col="hideSecondCol"
              @update:hide-second-col="(val) => (hideSecondCol = val)"
            />
          </CoreRow>
          <CoreRow class="pa-0 ma-0" style="height: 100dvh">
            <!-- Main Content-->
            <CoreMain
              class="rounded-borders"
              style="
                margin-top: calc(12px + 0.5rem) !important;
                padding-top: calc(var(--v-layout-top) - 10px) !important;
              "
            >
              <router-view
                v-slot="{ Component }"
                class="rounded-borders curved-display-padding-bottom"
                style="overflow-y: auto !important; overflow-x: hidden"
              >
                <CoreScaleTransition mode="out-in">
                  <component :is="Component" />
                </CoreScaleTransition>
              </router-view>
            </CoreMain>
          </CoreRow>
        </CoreColumn>
      </CoreRow>
    </CoreContainer>
  </CoreLayout>
</template>

<script lang="ts">
import { throttle } from "lodash";
import { defineComponent } from "vue";

import AppBar from "./components/AppBar.vue";
import AppDrawer from "./components/AppDrawer.vue";

export default defineComponent({
  name: "AppLayout",
  components: {
    AppDrawer,
    AppBar,
  },
  data() {
    const showDrawer: boolean = false;

    return {
      showDrawer,
      prevScrollpos: 0,
      hideSecondCol: false,
      throttledScrollHandler: throttle((e) => this.handleScrollfunction(e), 250),
    };
  },
  computed: {
    appBarHeight() {
      if (
        !this.$vuetify.display.mobile ||
        (!this.$route.meta?.search &&
          !this.$route.meta?.addAreaButton &&
          !this.$route.meta?.toggleAreasViewButton &&
          !this.$route.meta?.dndSwitch &&
          !this.$route.meta?.workbenchButtons &&
          !this.$route.meta?.addRuleButton &&
          !this.$route.meta?.createReportButton)
      )
        return 60;
      return this.hideSecondCol ? 60 : 120;
    },
    drawer: {
      get() {
        return this.showDrawer;
      },
      set(value: boolean) {
        this.showDrawer = value;
      },
    },
    route() {
      return this.$route;
    },
    isSearchActive(): boolean {
      return this.$store.getters["app/isSearchActive"];
    },
  },
  watch: {
    route: [
      {
        handler: "resetScroll",
      },
    ],
  },
  mounted() {
    window.addEventListener("scroll", this.throttledScrollHandler, true);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.throttledScrollHandler, true);
  },
  methods: {
    handleScrollfunction(event: Event) {
      if (!this.$vuetify?.display) return;
      if (!event) return;
      const target = event.target as HTMLDivElement;

      // ignore scroll in modals/dialogs
      if (target.parentElement?.classList.contains("v-overlay__content")) return;

      const currentScrollPos = target.scrollTop;
      if (
        Math.abs(this.prevScrollpos - currentScrollPos) > 1000 ||
        !this.$vuetify.display.mobile ||
        target.scrollTop + target.clientHeight >= target.scrollHeight
      ) {
        return;
      }
      if (this.prevScrollpos > currentScrollPos) {
        this.hideSecondCol = false;
      } else {
        if (currentScrollPos > 90 && !this.isSearchActive) {
          this.hideSecondCol = true;
        }
      }
      this.prevScrollpos = currentScrollPos;
    },
    resetScroll() {
      this.prevScrollpos = 0;
      this.hideSecondCol = false;
    },
  },
});
</script>

<style lang="scss">
@import "./src/ui/scss/variables";

.v-main,
.layout {
  height: 100%;
}

.no-column-wrap {
  flex-wrap: nowrap;
}
</style>
