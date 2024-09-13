<template>
  <CoreApp :class="[{ 'prevent-user-text-selection': $vuetify.display.mobile }]">
    <template v-if="!loading">
      <template v-if="isLoggedIn">
        <AppLayout />
        <ReportMessage />
      </template>
      <template v-else>
        <router-view />
        <ReportMessage />
      </template>
    </template>
    <template v-else>
      <CircleSpinner :size="80" color="accent" />
    </template>
  </CoreApp>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { store } from "@/store";
import CircleSpinner from "@/ui/components/components/CenteredCircleSpinner.vue";
import ReportMessage from "@/ui/components/components/ReportMessage.vue";
import AppLayout from "@/ui/layout/AppLayout.vue";
import { Auth } from "@/utils/Auth";

export default defineComponent({
  components: {
    AppLayout,
    ReportMessage,
    CircleSpinner,
  },
  data() {
    return {
      loading: true,
    };
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters["app/isLoggedIn"];
    },
  },
  watch: {
    isLoggedIn: [{ handler: "logginChange", immediate: true }],
  },
  created() {
    this.authCheck();
  },
  unmounted() {
    Auth.ClearTimer();
  },
  methods: {
    logginChange(val: boolean) {
      this.loading = true;
      if (val) {
        this.authCheck();
      }
    },
    authCheck() {
      Auth.checkCookies().finally(() => {
        if (!this.isLoggedIn && !this.$route.meta?.auth) {
          this.$router.push({ path: "/login" }).catch(() => {});
        }
        if (this.isLoggedIn && this.$route.meta?.auth) {
          this.$router.push({ path: "/" }).catch(() => {});
        }
        this.loading = false;
      });
    },
  },
});
</script>

<style lang="scss" scoped>
.v-application {
  height: 100dvh;
}
</style>
