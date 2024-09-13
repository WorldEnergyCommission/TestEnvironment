<template>
  <AuthLayout v-if="!isLoggedIn" :title-text="$t('auth.login.title')">
    <div v-if="loginError" class="toast toast-warning mb-3">
      {{ $t("auth.login.error") }}
    </div>
    <form action="javascript:void(0);">
      <CoreTextField
        v-model="user"
        :label="$t('auth.common.email')"
        :rules="[rules.required, rules.email]"
        hide-details
        class="mb-3"
      />
      <CoreTextField
        v-model="password"
        :append-inner-icon="showPassword ? 'mdi:mdi-eye' : 'mdi:mdi-eye-off'"
        :label="$t('auth.common.password')"
        :rules="[rules.required, rules.min]"
        :type="showPassword ? 'text' : 'password'"
        hide-details
        name="input-password"
        @click:append-inner="showPassword = !showPassword"
      />
      <CoreCheckbox v-model="useOTP" :label="$t('auth.login.otp') + '?'" hide-details />
      <CoreOtpInput
        v-if="useOTP"
        v-model="otp"
        :label="$t('auth.login.otp')"
        hide-details
        length="6"
        style="max-width: 320px"
        @finish="login"
      />
      <span>
        <router-link class="auth_router_link" to="/reset-credentials">{{
          $t("auth.login.forgotPassword")
        }}</router-link>
      </span>
      <CoreButton block button-type="primary" size="large" type="submit" @click="login">
        {{ $t("auth.login.login") }}
      </CoreButton>
    </form>
    <div v-if="canRegister">
      <span
        >{{ $t("auth.login.newUser") }}
        <router-link class="auth_router_link" to="/register"
          >{{ $t("auth.login.register") }}
        </router-link>
      </span>
    </div>
  </AuthLayout>
  <CircleSpinner v-else :size="80" color="accent" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { store } from "@/store";
import { RootState } from "@/store/types";
import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import AuthLayout from "@/ui/layout/AuthLayout.vue";
import { Auth } from "@/utils/Auth";
import { rules } from "@/utils/validationUtils";

const otpLocalStorageKey = "useOTP";

export default defineComponent({
  components: {
    AuthLayout,
    CircleSpinner,
  },
  data() {
    return {
      rules: rules,
      user: "",
      password: "",
      useOTP: false,
      loginError: false,
      otp: "",
      canRegister: false,
      showPassword: false,
    };
  },
  computed: {
    appState() {
      return (this.$store.state as RootState).app;
    },
    isLoggedIn() {
      return this.appState.auth.accessToken !== "";
    },
  },
  watch: {
    isLoggedIn: [
      {
        handler: "redirectIfAlreadyLoggedIn",
      },
    ],
    useOTP: [
      {
        handler: "storeOTPChoice",
      },
    ],
  },
  created() {
    Auth.registrationAllowed().then((allowed) => (this.canRegister = allowed));
    this.redirectIfAlreadyLoggedIn(this.isLoggedIn);

    const locStr = localStorage.getItem(otpLocalStorageKey);
    if (locStr) {
      this.useOTP = JSON.parse(locStr);
    }
  },
  methods: {
    login() {
      const prom = this.useOTP
        ? Auth.loginWithUserPasswordAndOTP(this.user, this.password, this.otp)
        : Auth.loginWithUserPassword(this.user, this.password);

      prom
        .then(() => {
          this.$router.push({ path: "/" }).catch(() => {});
        })
        .catch(() => (this.loginError = true));
    },
    redirectIfAlreadyLoggedIn(val: boolean) {
      if (val) {
        this.$router.push("/").catch(() => {});
      }
    },
    storeOTPChoice(val: boolean) {
      localStorage.setItem(otpLocalStorageKey, JSON.stringify(val));
    },
  },
});
</script>

<style>
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-background-clip: text;
  transition: background-color 5000s ease-in-out 0s;
  box-shadow: inset 10 10 20px 20px;
}
</style>
