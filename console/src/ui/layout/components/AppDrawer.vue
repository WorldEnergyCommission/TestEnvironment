<template>
  <!-- Navigation on the left side -->
  <CoreNavigationDrawer
    v-model="drawer"
    :class="[
      'app-drawer',
      'bg-sideBarColor',
      'rounded-borders',
      'curved-display-margin',
      'height-100dvh-minus-spacing',
    ]"
    :rail="showPermanent && isMini"
    :permanent="showPermanent"
  >
    <!--  Logo  -->
    <template #prepend>
      <CoreListItem class="py-6">
        <router-link to="/">
          <img
            :src="getLogo"
            alt="logo"
            style="display: block; cursor: pointer; max-width: 100%; margin: auto; max-height: 40px"
          />
        </router-link>
      </CoreListItem>
      <CoreDivider></CoreDivider>
    </template>

    <CoreList class="pb-0" nav v-model::opened="openedListGroups">
      <!--  Navigation  -->
      <AppNavigationItem v-for="(item, index) in topNavigation" :key="index" :item="item">
      </AppNavigationItem>
      <!-- <v-list-group class="pt-0" density="comfortable" value="project"> -->
      <!-- <template v-slot:activator="{ props }">
        <AppNavigationItem
          v-bind="props"
          :item="{ icon: 'fa-tree-city', locale: 'uiComponents.buttons.project' }"
        >
        </AppNavigationItem>
      </template> -->
      <AppNavigationItem v-for="(item, index) in newProjectNavigation" :key="index" :item="item">
      </AppNavigationItem>
      <!-- </v-list-group> -->
      <AppNavigationItem v-for="(item, index) in bottomNavigation" :key="index" :item="item">
      </AppNavigationItem>
    </CoreList>
    <template #append>
      <CoreList
        density="default"
        :nav="$vuetify.display.mobile"
        :class="[{ 'curved-display-padding-bottom': !$vuetify.display.mobile }]"
      >
        <CoreListItem v-if="!isMini && hasSideBarBadge">
          <TuevBadge />
        </CoreListItem>
        <CoreDivider color="accent" />

        <!-- User settings button -->
        <UserProfile :offset-x="true" :offset-y="false">
          <template #default="{ displayName: profileDisplayName, props: userProfileSlotProps }">
            <CoreListItem class="navigation-list-item" v-bind="userProfileSlotProps">
              <template #prepend>
                <lynus-icon :size="iconSizes" color="accent" name="avatar" />
              </template>
              <CoreListItemTitle>
                {{ profileDisplayName }}
              </CoreListItemTitle>
            </CoreListItem>
          </template>
        </UserProfile>

        <!-- Change language -->
        <MenuLocalisation :offset-x="true" :offset-y="false" :icon-sizes="iconSizes" />

        <!--  Switch themes  -->
        <ToggleThemesButton :icon-size="iconSizes" />

        <!--  Button close navigation  -->
        <CoreListItem
          v-if="!$vuetify.display.mobile"
          class="navigation-list-item"
          @click="isMini = !isMini"
        >
          <template #prepend>
            <CoreIcon
              :icon="isMini ? 'fas fa-arrow-right' : 'fas fa-arrow-left'"
              color="accent"
              size="small"
              rounded="xl"
              variant="outlined"
            />
          </template>
          <CoreListItemTitle>
            {{ $t("uiComponents.minimizeNavigationButton") }}
          </CoreListItemTitle>
        </CoreListItem>
      </CoreList>
    </template>
  </CoreNavigationDrawer>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useTheme, useDisplay } from "vuetify";
import { useStore } from "vuex";

import AppNavigationItem from "./AppNavigationItem.vue";
import { IAppNavigation, IProjectNavigation } from "@/store/modules/navigation/types";
import { RootState } from "@/store/types";
import ToggleThemesButton from "@/ui/components/components/ToggleThemesButton.vue";
import UserProfile from "@/ui/components/components/UserProfile.vue";
import MenuLocalisation from "@/ui/components/localization/MenuLocalisation.vue";
import TuevBadge from "@/ui/core/components/badge/TuevBadge.vue";
import { envFaviconURL, envLogoURLDark, envLogoURLLight, sideBarBadge } from "@/utils/env";
import { cloneDeep } from "lodash";

/**
 * Component that represent navigation drawer
 */

const props = defineProps({
  modelValue: {
    type: Boolean,
  },
});

const emit = defineEmits(["update:modelValue"]);

const isDrawerMini = ref(false);

const isMini = computed({
  get() {
    return isDrawerMini.value;
  },
  set(value: boolean) {
    if (mobile.value) {
      drawer.value = !value;
      isDrawerMini.value = false;
    } else {
      isDrawerMini.value = value;
    }
  },
});

const hasSideBarBadge = computed(() => sideBarBadge && sideBarBadge != "");
const { name: displayName, mobile } = useDisplay();
const { current: theme } = useTheme();

/** always show drawer if not on small screens */
const showPermanent = computed(() => !mobile.value);

/**
 * Defines icon size
 * @return {number} size
 */
const iconSizes = computed(() => {
  return { xs: 16, sm: 16, md: 20, lg: 22, xl: 22, xxl: 22 }[displayName.value];
});

const drawer = computed({
  get() {
    return showPermanent.value ? true : props.modelValue;
  },
  set(val: boolean) {
    emit("update:modelValue", val);
  },
});

const getLogo = computed(() => {
  if (isMini.value) return envFaviconURL;
  const isLight = !theme.value.dark;
  return isLight ? envLogoURLLight : envLogoURLDark;
});

// ----------------- Navigation -----------------

// Constants
const store = useStore();
const route = useRoute();

// Computed Properties
const membersState = computed(() => (store.state as RootState).members);
const currentMember = computed(() => membersState.value.currentMember);
const isCurrentMemberAdmin = computed(() => currentMember.value?.admin);
const projectNavigationForMember = computed(() => {
  return projectNavigation.value.filter(
    (el) =>
      el.requiresOnePermissionOf.length === 0 ||
      el.requiresOnePermissionOf.some((permission) => hasCurrentMemberPermission.value(permission)),
  );
});

const currentNavigationType = computed(() => route.meta?.navigation ?? "appNavigation");

const appNavigationFiltered = computed(
  (): IAppNavigation[] => store.getters["navigation/appNavigationFiltered"],
);

const topNavigation = computed(() =>
  appNavigationFiltered.value
    .filter((item) => item.name === "Benchmarking" || item.name === "Home")
    .map((item) => {
      const i = cloneDeep(item);
      if (currentNavigationType.value === "projectNavigation" && item.name !== "Home") {
        i.path = undefined;
        i.pathName = undefined;
        i.disabled = true;
      }
      return i;
    }),
);
const bottomNavigation = computed(() =>
  appNavigationFiltered.value
    .filter((item) => item.name !== "Benchmarking" && item.name !== "Home")
    .map((item) => {
      const i = cloneDeep(item);
      if (currentNavigationType.value === "projectNavigation" && item.name !== "Home") {
        i.path = undefined;
        i.pathName = undefined;
        i.disabled = true;
      }
      return i;
    }),
);
const projectNavigation = computed(
  (): IProjectNavigation[] => store.getters["navigation/projectNavigation"],
);
const hasCurrentMemberPermission = computed(
  (): ((permission: string) => boolean) => store.getters["members/hasPermission"],
);

// Function

const chargingMappings = computed(() =>
  store.getters["dataMappings/filteredByTypeName"]("Charging Station"),
);

const newProjectNavigation = computed(() => {
  let items =
    isCurrentMemberAdmin.value || currentNavigationType.value === "appNavigation"
      ? projectNavigation.value
      : projectNavigationForMember.value;

  const hasNoCharging =
    currentNavigationType.value === "appNavigation" ||
    !chargingMappings.value ||
    chargingMappings.value.length < 1;

  if (hasNoCharging) {
    items = items.filter((item) => item.name !== "Charging");
  }
  return items.map((item) => {
    if (currentNavigationType.value === "appNavigation") {
      item.path = undefined;
      item.pathName = undefined;
      item.disabled = true;
    }
    return item;
  });
});

const openedListGroups = ref<string[]>([]);

const { t } = useI18n();
</script>

<style lang="scss">
// .navigation-drawer {
//   z-index: 60 !important;
// }

.app-drawer {
  // z-index: 60 !important;

  .v-navigation-drawer__border {
    display: none !important;
  }

  .v-item--active {
    opacity: 1;

    .v-list-item__action {
      .lynus-icon {
        color: rgb(var(--v-theme-accent)) !important;
      }
    }
  }
}
</style>
