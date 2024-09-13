<template>
  <div class="localisation-button">
    <CoreMenu>
      <template #activator="{ props: menu }">
        <CoreTooltip location="bottom" v-bind="menu">
          <template #activator="{ props: tooltip }">
            <CoreButton
              button-type="standardIcon"
              height="35"
              width="35"
              v-bind="propsMerge(menu, tooltip)"
            >
              <lynus-icon color="theme" name="language" />
            </CoreButton>
          </template>
          <span>{{ $t("uiComponents.tooltips.languages") }}</span>
        </CoreTooltip>
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
  </div>
</template>

<script lang="ts">
import "moment/locale/de";
import "moment/locale/it";
import { defineComponent } from "vue";

import LocalisationLogic from "./LocalisationLogic";

/**
 * Localization change in auth screens
 */
export default defineComponent({
  extends: LocalisationLogic,
});
</script>

<style lang="scss" scoped></style>
