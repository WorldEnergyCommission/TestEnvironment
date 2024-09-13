<template>
  <CoreMenu>
    <template #activator="{ props }">
      <CoreListItem class="navigation-list-item" v-bind="props">
        <template #prepend>
          <lynus-icon :size="iconSizes" color="accent" name="language" />
        </template>
        <CoreListItemTitle>
          {{ $t("uiComponents.tooltips.languages") }}
        </CoreListItemTitle>
      </CoreListItem>
    </template>

    <CoreList>
      <CoreListItem
        v-for="(item, index) in languages"
        :key="index"
        link
        @click="handleLocale(index)"
      >
        <CoreListItemTitle :class="[{ 'accent--text': index === selectedLanguage }]">
          {{ $t(item.title) }}
        </CoreListItemTitle>
      </CoreListItem>
    </CoreList>
  </CoreMenu>
</template>

<script lang="ts">
import "moment/locale/de";
import "moment/locale/it";
import { defineComponent } from "vue";

import LocalisationLogic from "./LocalisationLogic";

/**
 * Changing localization in the menu
 */
export default defineComponent({
  extends: LocalisationLogic,
});
</script>

<style lang="scss" scoped></style>
