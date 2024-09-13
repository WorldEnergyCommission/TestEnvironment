<!-- eslint-disable vuetify/no-deprecated-components -->
<template>
  <AuthLayout
    :title-text="!inviteData ? $t('auth.register.title') : $t('auth.register.inviteTitle')"
  >
    <template v-if="!loading">
      <div v-if="currentStep != 3 && !inviteData" class="form-group">
        <router-link class="auth_router_link" to="/login">
          « {{ $t("auth.common.backToLogin") }}
        </router-link>
      </div>
      <div v-if="currentStep === 3 && !inviteData" class="toast toast-warning">
        {{ $t("auth.register.verify") }}
      </div>
      <div v-if="inviteData && currentStep != 3" class="toast toast-warning">
        {{
          $t("auth.register.inviteText")
            .toString()
            .replace("USERNAME", inviteData?.inviter)
            .replace("PROJECTNAME", inviteData.project_name)
        }}
      </div>
      <div v-if="inviteData && inviteData.used_at" class="toast toast-warning mt-3">
        {{ `Invite expired..` }}
      </div>
      <form
        v-if="!inviteData || !inviteData.used_at"
        action="javascript:void(0);"
        class="register__form"
      >
        <CoreStepper v-model="currentStep" alt-labels>
          <CoreStepperHeader>
            <CoreStepperItem :complete="currentStep > 1" :value="1">
              {{ $t("auth.register.stepAccount") }}
            </CoreStepperItem>
            <CoreDivider />
            <CoreStepperItem :complete="currentStep > 2" :value="2">
              {{ $t("auth.register.stepBilling") }}
            </CoreStepperItem>
            <CoreDivider />
            <CoreStepperItem :value="3">
              {{ $t("auth.register.stepVerification") }}
            </CoreStepperItem>
          </CoreStepperHeader>

          <CoreStepperWindow>
            <!-- User profile (step 1) -->
            <CoreStepperWindowItem :value="1" style="padding: unset">
              <CoreRow style="margin: 1px">
                <CoreColumn lg="6" md="6" cols="12" style="padding-bottom: 0px">
                  <CoreTextField
                    v-model="user.firstName"
                    :label="$t('auth.register.firstname')"
                    hide-details
                  />
                </CoreColumn>
                <CoreColumn lg="6" md="6" cols="12" style="padding-bottom: 0px">
                  <CoreTextField
                    v-model="user.lastName"
                    :label="$t('auth.register.lastname')"
                    hide-details
                  />
                </CoreColumn>
                <CoreColumn
                  v-if="!emailAsUser"
                  lg="12"
                  md="12"
                  cols="12"
                  style="padding-bottom: 0px"
                >
                  <CoreTextField
                    v-model="user.username"
                    :label="$t('auth.common.username')"
                    hide-details
                  />
                </CoreColumn>
                <CoreColumn lg="12" md="12" cols="12" style="padding-bottom: 0px">
                  <CoreTextField
                    v-model="user.email"
                    :label="$t('auth.common.email')"
                    hide-details
                    type="email"
                    :disabled="!!inviteData"
                  />
                </CoreColumn>
                <CoreColumn lg="12" md="12" cols="12" style="padding-bottom: 0px">
                  <CoreTextField
                    v-model="user.attributes.mobile[0]"
                    :label="$t('auth.register.mobileNumber')"
                    hide-details
                  />
                </CoreColumn>
                <CoreColumn lg="12" md="12" cols="12" style="padding-bottom: 0px">
                  <CoreTextField
                    v-model="user.password"
                    :append-inner-icon="showPassword ? 'mdi:mdi-eye' : 'mdi:mdi-eye-off'"
                    :label="$t('auth.common.password')"
                    :type="showPassword ? 'text' : 'password'"
                    hide-details
                    name="input-password"
                    @click:append-inner="showPassword = !showPassword"
                  />
                </CoreColumn>
                <CoreColumn lg="12" md="12" cols="12" style="padding-bottom: 0px">
                  <CoreTextField
                    v-model="user.password_confirm"
                    :append-inner-icon="showPasswordConfirm ? 'mdi:mdi-eye' : 'mdi:mdi-eye-off'"
                    :label="$t('auth.register.passwordConfirm')"
                    :type="showPasswordConfirm ? 'text' : 'password'"
                    hide-details
                    name="input-password"
                    @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
                  />
                </CoreColumn>
                <CoreColumn lg="12" md="12" cols="12" class="mt-4">
                  <CoreButton
                    :disabled="!isFirstPageValid"
                    block
                    button-type="primary"
                    size="large"
                    @click="currentStep = 2"
                  >
                    {{ $t("auth.register.continue") }}
                  </CoreButton>
                </CoreColumn>
              </CoreRow>
            </CoreStepperWindowItem>
            <!-- Billing (step 2) -->
            <CoreStepperWindowItem :value="2" style="padding: unset">
              <CoreRow style="margin: 1px">
                <CoreColumn lg="12" md="12" cols="12" style="padding-bottom: 0px">
                  <CoreTextField
                    v-model="user.attributes['address.street'][0]"
                    :label="$t('auth.register.addressStreet')"
                    hide-details
                  />
                </CoreColumn>
                <CoreColumn lg="12" md="12" cols="12" style="padding-bottom: 0px">
                  <CoreSelect
                    v-model="user.attributes['address.country'][0]"
                    :label="$t('auth.register.addressCountry')"
                    hide-details
                    autocomplete="country"
                    item-title="text"
                    item-value="value"
                    hide-selected
                    :items="countries"
                  />
                </CoreColumn>
                <CoreColumn lg="4" md="4" cols="4" style="padding-bottom: 0px">
                  <CoreTextField
                    v-model="user.attributes['address.zip'][0]"
                    :label="$t('auth.register.addressZipCode')"
                    hide-details
                  />
                </CoreColumn>
                <CoreColumn lg="8" md="8" cols="8" style="padding-bottom: 0px">
                  <CoreTextField
                    v-model="user.attributes['address.city'][0]"
                    :label="$t('auth.register.addressCity')"
                    hide-details
                  />
                </CoreColumn>
                <CoreColumn lg="12" md="12" cols="12" style="padding-bottom: 0px">
                  <CoreCheckbox
                    v-model="registerCompany"
                    :label="$t('auth.register.optionRegisterCompany')"
                    hide-details
                  />
                </CoreColumn>
                <CoreColumn
                  v-if="registerCompany && user.attributes['organization.name']"
                  lg="12"
                  md="12"
                  cols="12"
                  style="padding-bottom: 0px"
                >
                  <CoreTextField
                    v-model="user.attributes['organization.name'][0]"
                    :label="$t('auth.register.companyName')"
                    hide-details
                  />
                </CoreColumn>
                <CoreColumn
                  v-if="registerCompany && user.attributes['organization.id']"
                  lg="12"
                  md="12"
                  cols="12"
                  style="padding-bottom: 0px"
                >
                  <CoreTextField
                    v-model="user.attributes['organization.id'][0]"
                    :label="$t('auth.register.companyId')"
                    hide-details
                  />
                </CoreColumn>
                <CoreColumn lg="6" md="6" cols="6">
                  <CoreButton block button-type="secondary" size="large" @click="currentStep = 1">
                    {{ $t("auth.register.back") }}
                  </CoreButton>
                </CoreColumn>
                <CoreColumn lg="6" md="6" cols="6">
                  <CoreButton
                    :disabled="!isFormValid"
                    block
                    button-type="primary"
                    size="large"
                    @click="register"
                  >
                    {{ $t("auth.register.register") }}
                  </CoreButton>
                </CoreColumn>
              </CoreRow>
            </CoreStepperWindowItem>
            <!-- User profile (step 1) -->
            <CoreStepperWindowItem :value="3">
              <span v-if="!inviteData">
                {{ $t("auth.register.verifyInstructions") }}
              </span>
              <span v-else>
                {{
                  $t("auth.register.inviteVerification")
                    .toString()
                    .replace("PROJECTNAME", inviteData.project_name)
                }}
              </span>
              <br />
              <br />
              <router-link class="auth_router_link" to="/login">
                « {{ $t("auth.common.backToLogin") }}
              </router-link>
            </CoreStepperWindowItem>
          </CoreStepperWindow>
        </CoreStepper>
      </form>
    </template>
    <CircleSpinner v-else :size="80" color="accent" class="d-flex justify-center" />
  </AuthLayout>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import { useTheme } from "vuetify";

import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import AuthLayout from "@/ui/layout/AuthLayout.vue";
import { Auth } from "@/utils/Auth";
import { emailAsUser } from "@/utils/env";

type User = {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  attributes: {
    mobile: string[];
    "address.street": string[];

    "address.country": string[];

    "address.zip": string[];
    "address.city": string[];
    "organization.name"?: string[];
    "organization.id"?: string[];
  };
  password: string;
  password_confirm: string;
};

type InviteData = {
  ProjectID: string;
  email: string;
  inviter: string;
  project_name: string;
  used_at: string;
};

type OptionalInviteData = undefined | InviteData;

export default defineComponent({
  components: {
    AuthLayout,
    CircleSpinner,
  },
  setup() {
    return { emailAsUser };
  },
  data() {
    const inviteData = undefined as OptionalInviteData;
    const user: User = {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      attributes: {
        mobile: [""],
        "address.street": [""],

        "address.country": [""],

        "address.zip": [""],
        "address.city": [""],
        "organization.name": [""],
        "organization.id": [""],
      },
      password: "",
      password_confirm: "",
    };

    return {
      currentStep: 1,
      registerCompany: false,
      showPassword: false,
      showPasswordConfirm: false,
      loading: true,
      user,
      inviteData,
    };
  },
  computed: {
    countries() {
      return [
        { text: this.$t("auth.register.addressCountrySwitzerland"), value: "ch" },
        { text: this.$t("auth.register.addressCountryGermany"), value: "de" },
        { text: this.$t("auth.register.addressCountryAustria"), value: "at" },
        { text: this.$t("auth.register.addressCountryItaly"), value: "it" },
      ];
    },
    isFirstPageValid() {
      if (this.user.firstName.length < 2 || this.user.lastName.length < 2) return false;
      if (this.user.attributes.mobile.length === 0) return false;
      if (this.user.password.length < 3 || this.user.password_confirm.length < 3) return false;
      if (!this.emailAsUser && (!this.user.username || this.user.username === "")) {
        return false;
      }
      return true;
    },
    isFormValid() {
      if (!this.isFirstPageValid) return false;

      if (
        this.user.attributes["address.street"][0].length < 2 ||
        this.user.attributes["address.country"][0].length === 0 ||
        this.user.attributes["address.zip"][0] === "" ||
        this.user.attributes["address.city"][0].length < 2
      )
        return false;

      if (this.registerCompany) {
        if (
          this.user.attributes["organization.name"]
            ? this.user.attributes["organization.name"][0].length === 0
            : true
        )
          return false;
      }

      if (!this.emailAsUser && (!this.user.username || this.user.username === "")) {
        return false;
      }

      return true;
    },
  },
  async created() {
    useTheme().global.name.value = "light";

    // Check if there are any query parameters in the current route
    if (this.$route.query.invite) {
      const data = await axios
        .get(`${Auth.getRealmUrl()}/invite?invite_id=${this.$route.query.invite}`)
        .then((response) => response.data);
      this.inviteData = data;
      this.user.email = data.email;
    }

    this.loading = false;
  },
  methods: {
    register() {
      const u = this.user;
      if (!this.registerCompany) {
        delete u.attributes["organization.name"];
        delete u.attributes["organization.id"];
      }

      if (this.emailAsUser) {
        delete u.username;
      }

      const invite = this.inviteData ? this.$route.query.invite : undefined;
      Auth.Register(u, invite as string).then(() => (this.currentStep = 3));
    },
  },
});
</script>

<style>
.toast.toast-warning {
  background: rgba(255, 183, 0, 0.95);
  border-color: #ffb700;
}

.toast {
  background: rgba(48, 55, 66, 0.95);
  border: 0.05rem solid #303742;
  border-color: #303742;
  border-radius: 0.1rem;
  color: #fff;
  display: block;
  padding: 0.4rem;
  width: 100%;
}

.register__form .v-window.v-stepper-window {
  margin-top: 0px;
}
</style>
