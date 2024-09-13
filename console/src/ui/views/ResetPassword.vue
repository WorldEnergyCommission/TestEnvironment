<template>
  <AuthLayout :title-text="$t('auth.resetPassword.title')">
    <div v-if="!finishedReset">
      <form action="javascript:void(0);">
        <CoreTextField
          v-model="user"
          :label="$t('auth.common.email')"
          hide-details
          :disabled="loading"
          class="mb-3"
        />

        <CoreButton
          block
          button-type="primary"
          size="large"
          :loading="loading"
          class="mb-2"
          @click="ResetPassword"
        >
          {{ $t("auth.common.submit") }}
        </CoreButton>
      </form>
      <router-link class="auth_router_link mb-4" to="//login">
        « {{ $t("auth.common.backToLogin") }}
      </router-link>

      <div>
        {{ $t("auth.resetPassword.details") }}
      </div>
    </div>
    <div v-else>
      <span>{{ $t("auth.resetPassword.successMessage") }}</span>
      <br />
      <br />
      <router-link class="auth_router_link" to="//login">
        « {{ $t("auth.common.backToLogin") }}
      </router-link>
    </div>
  </AuthLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useTheme } from "vuetify";

import AuthLayout from "@/ui/layout/AuthLayout.vue";
import { Auth } from "@/utils/Auth";

export default defineComponent({
  components: {
    AuthLayout,
  },
  data() {
    return {
      user: "",
      finishedReset: false,
      loading: false,
    };
  },
  created() {
    useTheme().global.name.value = "light";
  },
  methods: {
    ResetPassword() {
      this.loading = true;
      Auth.ResetPassword(this.user).then(() => {
        this.finishedReset = true;
        this.loading = false;
      });
    },
  },
});
</script>

<style></style>
