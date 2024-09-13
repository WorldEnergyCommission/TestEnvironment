<template>
  <div class="curved-display-margin">
    <AuthLocalisation style="top: 5rem; left: 2rem; position: absolute" />
    <CoreRow
      style="width: 100% !important; margin: 0px"
      :class="{ 'justify-center': $vuetify.display.mobile }"
    >
      <CoreColumn
        :style="$vuetify.display.mobile ? 'position: relative; top: 8rem;' : ''"
        class="left-col"
        lg="4"
        md="4"
        sm="12"
      >
        <CoreContainer>
          <div :style="$vuetify.display.mobile ? '' : 'padding:36px;'">
            <div>
              <img id="logo" :src="logoSRC" alt="logo" />
            </div>
            <h1 style="margin-top: 2rem; margin-bottom: 1rem">
              {{ titleText }}
            </h1>
            <slot />
          </div>
        </CoreContainer>
      </CoreColumn>
      <CoreColumn v-if="!$vuetify.display.mobile" id="cover" :style="coverSRC" />
    </CoreRow>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import AuthLocalisation from "@/ui/components/localization/AuthLocalisation.vue";
import { loginBackground, loginLogo, loginLogoDark } from "@/utils/env";

export default defineComponent({
  components: { AuthLocalisation },
  props: {
    titleText: { default: "Authtitle", type: String },
  },
  data() {
    return {
      coverSRC: `background-image: url('${loginBackground}') !important;`,
    };
  },
  computed: {
    logoSRC() {
      return this.$vuetify.theme.current.dark ? `${loginLogoDark}` : `${loginLogo}`;
    },
  },
});
</script>

<style lang="scss">
@import "./src/ui/scss/variables";

#cover {
  background-size: cover;
  background-position: center;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: calc($base-top-spacing-value * -1);
  margin-right: calc($base-right-spacing-value * -1);
  margin-bottom: calc($base-bottom-spacing-value * -1);
}

.left-col {
  display: flex;
  align-items: center;
}

#logo {
  width: 100%;
  height: 100px;
}

.form-group:not(:last-child) {
  margin-bottom: 0.4rem;
}

.form-group input {
  border-radius: 6px !important;
}

.form-input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: rgb(var(--v-theme-primary));
  background-image: none;
  border: 0.05rem solid #bcc3ce;
  border-radius: 6px !important;
  color: rgb(var(--v-theme-sideBarColor));
  display: block;
  font-size: 0.8rem;
  height: 1.8rem;
  line-height: 1.2rem;
  max-width: 100%;
  outline: 0;
  padding: 0.25rem 0.4rem;
  position: relative;
  transition:
    background 0.2s,
    border 0.2s,
    box-shadow 0.2s,
    color 0.2s;
  width: 100%;
}

.form-input:focus {
  border-color: #15202d;
  box-shadow: 0 0 0 0.1rem rgb(var(--v-theme-accent));
}

.auth_router_link {
  color: rgb(var(--v-theme-accent)) !important;
  outline: 0;
  text-decoration: none;
}

.auth_router_link:hover {
  text-decoration: underline;
}

.btn {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: 0.05rem solid;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-accent));
  border-radius: 0.1rem;
  cursor: pointer;
  display: inline-block;
  font-size: 0.8rem;
  height: 1.8rem;
  line-height: 1.2rem;
  outline: 0;
  padding: 0.25rem 0.4rem;
  text-align: center;
  text-decoration: none;
  transition:
    background 0.2s,
    border 0.2s,
    box-shadow 0.2s,
    color 0.2s;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;
}

.btn.disabled,
.btn:disabled,
.btn[disabled] {
  cursor: default;
  opacity: 0.5;
  pointer-events: none;
}

.btn.btn-primary {
  background: rgb(var(--v-theme-accent));
  border-color: rgb(var(--v-theme-accent));
  color: rgb(var(--v-theme-primary));
}

.btn:hover {
  background: rgb(var(--v-theme-accent));
  border-color: rgb(var(--v-theme-accent));
  color: rgb(var(--v-theme-primary));
}

.btn.btn-primary:hover {
  background: var(--v-accent-darken2);
  border-color: var(--v-accent-darken2);
}
</style>
