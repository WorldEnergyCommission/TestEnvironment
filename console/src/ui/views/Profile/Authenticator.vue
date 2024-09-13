<template>
  <CoreContainer class="mt-3">
    <CoreRow v-if="authenticators.length > 0">
      <CoreColumn cols="12">
        <div class="section-title">
          {{ $t("auth.mfa.usedAuthenticators") }}
        </div>
      </CoreColumn>
      <CoreColumn class="flex-shrink-1" cols="6 mb-3">
        <CoreTable dense>
          <template #default>
            <thead>
              <tr>
                <th class="text-center">
                  {{ $t("auth.mfa.name") }}
                </th>
                <th class="text-center">
                  {{ $t("auth.mfa.createdDate") }}
                </th>
                <th class="text-center">
                  {{ $t("auth.mfa.delete") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in authenticators" :key="item.id">
                <td class="text-center">
                  {{ formatAuthenticatiorName(item) }}
                </td>
                <td class="text-center">
                  {{ getDateTimeStringForItem(item) }}
                </td>
                <td class="text-center">
                  <CoreIcon class="mr-2" size="small" @click="deleteAuthenticator(item.id)">
                    mdi:mdi-delete
                  </CoreIcon>
                </td>
              </tr>
            </tbody>
          </template>
        </CoreTable>
      </CoreColumn>
    </CoreRow>
    <CoreRow v-if="!loading">
      <CoreColumn cols="12">
        <div class="section-title">
          {{ $t("auth.mfa.installOneOf") }}
        </div>
        <br />
        <ul>
          <li>FreeOTP</li>
          <li>Microsoft Authenticator</li>
          <li>Google Authenticator</li>
        </ul>
      </CoreColumn>
      <CoreColumn cols="12">
        <div class="section-title">
          {{ $t("auth.mfa.openAndScan") }}
        </div>
        <br />
        <img
          :class="$vuetify.theme.current.dark ? 'dark-mode-qr' : ''"
          :src="`data:image/png;base64,${qr}`"
          alt="OTP QR Code"
        />
        <br />
        <CoreButton button-type="primary" @click="showSecret = !showSecret">
          {{ $t("auth.mfa.problemScanning") }}
        </CoreButton>
        <div v-if="showSecret">Secret: {{ secret }}</div>
      </CoreColumn>

      <CoreColumn cols="12">
        <CoreForm ref="form" :disabled="authenticators.length > 0" action="javascript:void(0);">
          <div class="section-title">
            {{ $t("auth.mfa.enterAndSave") }}
          </div>
          <br />
          <CoreOtpInput
            v-model="initialCode"
            :label="$t('auth.login.otp')"
            :rules="[rules.required]"
            hide-details="auto"
            length="6"
            required
            style="max-width: 320px"
          />
          <br />
          {{ $t("auth.mfa.enterDeviceName") }}
          <CoreTextField
            v-model="deviceName"
            :label="$t('auth.mfa.deviceName')"
            class="mt-3"
            hide-details="auto"
            style="max-width: 320px"
          />
          <CoreButton
            :disabled="authenticators.length > 0 || initialCode === ''"
            class="mt-3"
            button-type="primary"
            type="submit"
            @click="addAuthenticator"
          >
            {{ $t("uiComponents.buttons.save") }}
          </CoreButton>
        </CoreForm>
      </CoreColumn>
    </CoreRow>
    <CircleSpinner v-else :size="80" class="d-flex justify-center" color="accent" />
  </CoreContainer>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import api from "@/store/api";
import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import { envApi } from "@/utils/env";
import { formatDate } from "@/utils/utilsFunctions";
import { rules } from "@/utils/validationUtils";

/**
 * Add authenticator to user profile
 */
export default defineComponent({
  components: {
    CircleSpinner,
  },
  setup() {
    const form = ref(null);
    return {
      form,
    };
  },
  data() {
    const authenticators: { id: string; device_name: string; created_date: number }[] = [];

    return {
      rules: rules,
      loading: true,
      showSecret: false,
      qr: "",
      secret: "",
      initialCode: "",
      deviceName: "",
      authenticators,
      getDateTimeStringForItem: (item: { created_date: number }) => {
        return formatDate(new Date(item.created_date));
      },
      formatAuthenticatiorName: (item: { device_name: string }) => {
        return item.device_name.trim() === "" ? "-" : item.device_name;
      },
    };
  },
  created() {
    this.fetchAuthenticators();
    this.fetchOptions();
  },
  methods: {
    async fetchOptions() {
      try {
        this.loading = true;
        const response = await api.fetch("/users/me/otp/qr", "GET");
        this.qr = response.QR;
        this.secret = response.Secret;
      } catch (e: any) {
        this.setReport({
          type: "error",
          message: e?.message,
          value: true,
        });
      } finally {
        this.loading = false;
      }
    },
    async fetchAuthenticators() {
      try {
        const response = await api.fetch("/users/me/otp", "GET");
        this.authenticators = response;
      } catch (e: any) {
        this.setReport({
          type: "error",
          message: e?.message,
          value: true,
        });
      }
    },
    async addAuthenticator() {
      try {
        const response = await api.fetch("users/me/otp", "POST", {
          secret: this.secret,
          initialCode: this.initialCode,
          deviceName: this.deviceName,
        });

        ((this.form as any).coreForm as any).reset();

        this.fetchAuthenticators();
        this.fetchOptions();
        this.setReport({
          type: "success",
          message: this.$t("auth.mfa.successMessage"),
          value: true,
        });
      } catch (e: any) {
        this.setReport({
          type: "error",
          message: e?.message,
          value: true,
        });
      }
    },
    async deleteAuthenticator(id: string) {
      try {
        const response = await api.fetch(`${envApi}/users/me/otp/${id}`, "DELETE");
        console.log(response);
        this.fetchAuthenticators();
      } catch (e: any) {
        this.setReport({
          type: "error",
          message: e?.message,
          value: true,
        });
      }
    },
    setReport(payload: any) {
      this.$store.commit("app/setReport", payload);
    },
  },
});
</script>
<style lang="scss">
.dark-mode-qr {
  mix-blend-mode: color-dodge;
  filter: invert(1);
}
</style>
