<template>
  <CoreContainer class="mt-3">
    <div class="section-title">
      {{ $t("auth.common.changePassword") }}
    </div>
    <CoreForm ref="form" action="javascript:void(0);">
      <CoreRow v-if="showFields" class="mt-3">
        <CoreColumn cols="12">
          <CoreTextField
            v-model="oldpass"
            :append-inner-icon="showPassword ? 'mdi:mdi-eye' : 'mdi:mdi-eye-off'"
            :label="$t('auth.common.password')"
            :rules="[rules.required, rules.min]"
            :type="showPassword ? 'text' : 'password'"
            hide-details="auto"
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
          />
        </CoreColumn>
        <CoreColumn cols="12">
          <CoreTextField
            v-model="newpass"
            :append-inner-icon="showPassword ? 'mdi:mdi-eye' : 'mdi:mdi-eye-off'"
            :label="$t('auth.common.newPassword')"
            :rules="[rules.required, rules.min]"
            :type="showPassword ? 'text' : 'password'"
            hide-details="auto"
            required
            @click:append-inner="showPassword = !showPassword"
          />
        </CoreColumn>
        <CoreColumn cols="12">
          <CoreTextField
            v-model="confirm"
            :append-inner-icon="showPassword ? 'mdi:mdi-eye' : 'mdi:mdi-eye-off'"
            :error-messages="secondInputErrors"
            :label="$t('auth.register.passwordConfirm')"
            :rules="[rules.required, rules.min]"
            :type="showPassword ? 'text' : 'password'"
            hide-details="auto"
            required
            @click:append-inner="showPassword = !showPassword"
          />
        </CoreColumn>
        <CoreColumn>
          <CoreButton
            :disabled="isSaveButtonDisabled"
            :loading="updating"
            button-type="primary"
            type="submit"
            @click="updatePassword"
          >
            {{ $t("uiComponents.buttons.save") }}
          </CoreButton>
        </CoreColumn>
      </CoreRow>
    </CoreForm>
  </CoreContainer>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import api from "@/store/api";
import { envClientId } from "@/utils/env";
import { rules } from "@/utils/validationUtils";

interface ResetPasswortdOptions {
  password: string;
  new_password: string;
  confirm_password: string;
  client_id: string;
  otp?: string;
}

export default defineComponent({
  setup() {
    const form = ref(null);
    return {
      form,
    };
  },
  data() {
    return {
      rules: rules,
      showPassword: false,
      updating: false,
      showFields: true,
      useOTP: false,
      oldpass: "",
      newpass: "",
      confirm: "",
      otp: "",
    };
  },
  computed: {
    isSaveButtonDisabled() {
      return (
        this.oldpass === "" ||
        this.newpass === "" ||
        this.confirm === "" ||
        (this.useOTP && this.otp === "") ||
        this.newpass !== this.confirm
      );
    },
    secondInputErrors() {
      if (this.newpass !== this.confirm) {
        return this.$t("validationRules.pwDontMatch");
      }
      return [];
    },
  },
  methods: {
    async updatePassword() {
      if (this.newpass !== this.confirm) {
        return;
      }

      try {
        this.updating = true;

        const data: ResetPasswortdOptions = {
          password: this.oldpass,
          new_password: this.newpass,
          confirm_password: this.confirm,
          client_id: envClientId,
        };

        if (this.useOTP) {
          data.otp = this.otp;
        }

        const response = await api
          .fetch("users/me/password", "PUT", data)
          .then(() =>
            this.setReport({
              type: "success",
              message: this.$t("userProfile.pw.success"),
              value: true,
            }),
          )
          .catch((err) => {
            if (err.response.status === 401) {
              this.setReport({
                type: "error",
                message: this.$t("errorMessages.wrongCredentials"),
                value: true,
              });
            } else {
              this.setReport({
                type: "error",
                message: this.$t("errorMessages.default"),
                value: true,
              });
            }
          });

        ((this.form as any).coreForm as any).reset();
        this.oldpass = "";
        this.newpass = "";
        this.confirm = "";
        this.otp = "";
      } finally {
        ((this.form as any).coreForm as any).reset();
        this.updating = false;
      }
    },
    setReport(payload: any) {
      this.$store.commit("app/setReport", payload);
    },
  },
});
</script>
