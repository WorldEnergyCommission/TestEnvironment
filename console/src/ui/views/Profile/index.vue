<template>
  <div class="project-index bottom-without-safe">
    <CoreContainer class="settings-list pa-0" fluid>
      <CoreRow>
        <CoreColumn lg="4" md="6" sm="12" xs="12">
          <CoreCard
            :class="[{ 'card-link__active': $route.meta.profile.general }, 'card-link']"
            style="border: solid 1px rgb(var(--v-theme-accent)) !important"
            to="/profile"
          >
            <lynus-icon color="lynusText" name="settings" size="25" />
            <div class="card-link-title">
              {{ $t("userProfile.general") }}
            </div>
          </CoreCard>
        </CoreColumn>
        <CoreColumn lg="4" md="6" sm="12" xs="12">
          <CoreCard
            :class="[{ 'card-link__active': $route.meta.profile.password }, 'card-link']"
            style="border: solid 1px rgb(var(--v-theme-accent)) !important"
            to="/profile/password"
          >
            <CoreIcon color="lynus-text"> fas fa-key </CoreIcon>
            <div class="card-link-title">
              {{ $t("userProfile.password") }}
            </div>
          </CoreCard>
        </CoreColumn>
        <CoreColumn lg="4" md="6" sm="12" xs="12">
          <CoreCard
            :class="[{ 'card-link__active': $route.meta.profile.otp }, 'card-link']"
            style="border: solid 1px rgb(var(--v-theme-accent)) !important"
            to="/profile/otp"
          >
            <CoreIcon color="lynus-text"> fas fa-fingerprint </CoreIcon>
            <div class="card-link-title">
              {{ $t("userProfile.authenticator") }}
            </div>
          </CoreCard>
        </CoreColumn>
      </CoreRow>
    </CoreContainer>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>
<style>
.section-title {
  font-size: 20px;
  line-height: 1;
}
</style>

<style lang="scss" scoped>
.card-link {
  border-radius: 10px;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 25px;
  background: rgb(var(--v-theme-inactiveItem));
  opacity: 0.6;

  &__active {
    opacity: 1;
    background: rgb(var(--v-theme-activeItem));
  }
}

.card-link-title {
  padding: 0 0 0 20px;
  font-size: 20px;
  color: rgb(var(--v-theme-lynusText));
}

.project-index {
  padding: 20px;
  min-height: 100%;
  position: relative;
}
</style>
