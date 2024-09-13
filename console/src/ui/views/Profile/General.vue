<template>
  <CoreContainer class="mt-3">
    <div class="section-title">
      {{ $t("auth.common.general") }}
    </div>
    <CoreRow class="mt-3">
      <CoreColumn cols="12" md="6">
        <CoreTextField
          v-model="firstname"
          :label="$t('auth.register.firstname')"
          :rules="[rules.required]"
          hide-details="auto"
          required
        />
      </CoreColumn>
      <CoreColumn cols="12" md="6">
        <CoreTextField
          v-model="lastname"
          :label="$t('auth.register.lastname')"
          :rules="[rules.required]"
          hide-details="auto"
          required
        />
      </CoreColumn>
      <CoreColumn cols="12">
        <CoreTextField
          v-model="email"
          :label="$t('auth.common.email')"
          :rules="[rules.required, rules.email]"
          disabled
          hide-details
        />
      </CoreColumn>
    </CoreRow>
    <CoreDivider class="mt-3" />
    <div class="section-title mt-3">
      {{ $t("auth.common.address") }}
    </div>
    <CoreRow v-if="loadedAddress" class="mt-3">
      <CoreColumn cols="12">
        <CoreTextField
          v-model="address.street"
          :label="$t('auth.register.addressStreet')"
          :rules="[rules.required]"
          hide-details="auto"
          required
        />
      </CoreColumn>
      <CoreColumn cols="12" md="6">
        <CoreSelect
          v-model="address.country"
          :items="countries"
          :label="$t('auth.register.addressCountry')"
          :rules="[rules.required]"
          hide-details="auto"
          hide-selected
          item-title="text"
          required
        />
      </CoreColumn>
      <CoreColumn cols="12" md="6">
        <CoreTextField
          v-model="address.city"
          :label="$t('auth.register.addressCity')"
          :rules="[rules.required]"
          hide-details="auto"
          required
        />
      </CoreColumn>
      <CoreColumn cols="12" md="6">
        <CoreTextField
          v-model="address.zip_code"
          :label="$t('auth.register.addressZipCode')"
          :rules="[rules.required]"
          hide-details="auto"
          required
        />
      </CoreColumn>
      <CoreColumn cols="12" md="6">
        <CoreTextField
          v-model="telnumber"
          :label="$t('auth.register.mobileNumber')"
          :rules="[rules.required]"
          hide-details="auto"
          required
        />
      </CoreColumn>
      <CoreColumn cols="12" md="6">
        <DeleteBanner :text="$t('auth.delete.message')">
          <DeleteModalForm
            :deleted-item-name="$t('auth.delete.account')"
            @delete-handler="deleteAccount"
          >
            <DeleteButton />
          </DeleteModalForm>
        </DeleteBanner>
      </CoreColumn>
      <CoreColumn cols="12" md="6" class="d-flex align-center flex-row-reverse">
        <CoreButton :loading="updating" button-type="primary" @click="updateInfo">
          {{ $t("uiComponents.buttons.save") }}
        </CoreButton>
      </CoreColumn>
      <CoreColumn v-if="isNativePlatform" cols="12" md="6" class="d-flex align-center">
        <CoreButton :loading="updating" button-type="secondary" @click="updateApp">
          {{ $t("uiComponents.buttons.updateApp") }}
        </CoreButton>
      </CoreColumn>
    </CoreRow>
    <CircleSpinner v-else :size="80" class="d-flex justify-center" color="accent" />
  </CoreContainer>
  <!--
  <option value="ch">{{ $t("auth.register.addressCountrySwitzerland") }}</option>
                    <option value="de">{{ $t("auth.register.addressCountryGermany") }}</option>
                    <option value="at">{{ $t("auth.register.addressCountryAustria") }}</option>
                    <option value="it">{{ $t("auth.register.addressCountryItaly") }}</option> -->
</template>

<script lang="ts">
import { Capacitor } from "@capacitor/core";
import { defineComponent } from "vue";

import api from "@/store/api";
import { IUser } from "@/store/modules/app/types";
import DeleteButton from "@/ui/components/components/buttons/DeleteButton.vue";
import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import DeleteBanner from "@/ui/components/components/DeleteBanner.vue";
import DeleteModalForm from "@/ui/components/modals/DeleteModalForm.vue";
import { forceUpdate } from "@/utils/appUpdateFunctions";
import { Auth } from "@/utils/Auth";
import { rules } from "@/utils/validationUtils";

export default defineComponent({
  components: {
    CircleSpinner,
    DeleteBanner,
    DeleteModalForm,
    DeleteButton,
  },
  data() {
    const address: {
      city: string;
      country: string;
      street: string;
      zip_code: string;
    } = { city: "", country: "", street: "", zip_code: "" };

    return {
      rules: rules,
      loadedAddress: false,
      updating: false,
      email: "",
      firstname: "",
      lastname: "",
      telnumber: "",
      address,
    };
  },
  computed: {
    countries() {
      return [
        { value: "de", text: this.$t("auth.register.addressCountryGermany") },
        { value: "at", text: this.$t("auth.register.addressCountryAustria") },
        { value: "it", text: this.$t("auth.register.addressCountryItaly") },
      ];
    },
    currentUser(): IUser {
      return this.$store.getters["app/getUser"];
    },
    isNativePlatform(): boolean {
      return Capacitor.isNativePlatform();
    },
  },
  created() {
    this.email = this.currentUser.email;
    this.firstname = this.currentUser.first_name;
    this.lastname = this.currentUser.last_name;
    this.fetchUserInfo();
  },
  methods: {
    async fetchUserInfo() {
      try {
        const response = await api.fetch(`/users/${this.currentUser.id}`, "GET");
        this.address = response.address;
        this.telnumber = response.mobile;
        this.loadedAddress = true;
      } catch (e: any) {
        this.setReport({
          type: "error",
          message: e?.message,
          value: true,
        });
      }
    },
    async updateInfo() {
      try {
        this.updating = true;
        const response = await api.fetch("/users/me", "PUT", {
          mobile: this.telnumber,
          first_name: this.firstname,
          last_name: this.lastname,
          address: {
            street: this.address.street,
            city: this.address.city,
            country: this.address.country,
            zip_code: this.address.zip_code,
          },
        });

        await this.fetchUserInfo();
      } catch (e: any) {
        this.setReport({
          type: "error",
          message: e?.message,
          value: true,
        });
      } finally {
        this.updating = false;
      }
    },
    async deleteAccount() {
      try {
        this.updating = true;
        const response = await api.fetch("/users/me", "DELETE");

        this.updating = false;
        Auth.Logout();
      } catch (e: any) {
        this.updating = false;
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
    async updateApp() {
      await forceUpdate();
    },
  },
});
</script>
