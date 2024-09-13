<template>
  <CoreListItem :to="location" class="navigation-list-item">
    <template #prepend>
      <lynus-icon
        :animation="item.animation"
        :color="iconColor"
        :name="item.icon"
        :size="item.icon && isCustomLib(item.icon) ? iconSizes - 2 : iconSizes"
      />
    </template>
    <CoreListItemTitle>
      {{ item.locale && t(item.locale) }}
    </CoreListItemTitle>
  </CoreListItem>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { useTheme, useDisplay } from "vuetify";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import { isCustomLib } from "@/utils/utilsFunctions";

const props = defineProps<{
  item: {
    path?: string;
    pathName?: string;
    icon: string;
    animation?: string;
    accepted?: boolean;
    locale: string;
    disabled?: boolean;
  };
}>();

const route = useRoute();

const { t } = useI18n();

const { name: displayName, mobile } = useDisplay();

/**
 * Defines icon size
 * @return {number} size
 */
const iconSizes = computed(() => {
  return { xs: 16, sm: 16, md: 20, lg: 22, xl: 22, xxl: 22 }[displayName.value];
});

const location = computed(() => {
  if (!props.item.pathName && !props.item.path) {
    return undefined;
  }
  return props.item.pathName
    ? { name: props.item.pathName, params: { id: route.params.id } }
    : props.item.path;
});

const iconColor = computed(() => {
  if (props.item.accepted) return "red";
  if (props.item.disabled) return "grey";
  return "accent";
});
</script>
<style lang="scss">
.navigation-list-item {
  opacity: 0.6;
  height: 50px !important;
  min-height: 20px !important;
  @media (min-width: 960px) and (max-width: 1264px) {
    height: 32px !important;
    min-height: 15px !important;
  }
  @media (max-width: 960px) {
    height: 32px !important;
    min-height: 15px !important;
  }

  .v-list-item__prepend {
    margin-right: 15px !important;
    .v-icon {
      opacity: 1;
    }
  }

  .v-list-item__title {
    color: rgb(var(--v-lynusTextSidebar));
  }

  .v-list-item__prepend .v-list-item__spacer {
    width: 0;
  }
}
</style>
