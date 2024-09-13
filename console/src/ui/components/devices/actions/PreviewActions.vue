<template>
  <CoreMenu v-model="isMenuOpen" :persistent="!isCloseOnClick" location="bottom start">
    <template #activator="{}">
      <CoreButton button-type="standardIcon" @click="isMenuOpen = !isMenuOpen">
        <CoreIcon>fas fa-ellipsis-v</CoreIcon>
      </CoreButton>
    </template>

    <CoreList>
      <template v-for="(item, index) in items">
        <CoreListItem v-if="item.visible" :key="index">
          <CoreListItemTitle style="cursor: pointer" @click="item.handle">
            <span @click="isMenuOpen = false">{{ $t(item.locale) }}</span>
          </CoreListItemTitle>
        </CoreListItem>
      </template>
    </CoreList>
  </CoreMenu>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * Component that represent devices actions list for previews
 */
export default defineComponent({
  props: {
    deviceType: {
      type: String,
    },
  },
  emits: ["switchSettingsView"],
  data() {
    return {
      isMenuOpen: false,
      isCloseOnClick: true,
    };
  },
  computed: {
    /**
     * List of all possible actions
     */
    items() {
      return [
        {
          name: "Add To Favorites",
          locale: "uiComponents.deviceActions.addToFavorites",
          handle: () => {},
          visible: true,
        },
        {
          name: "Settings",
          locale: "uiComponents.deviceActions.settings",
          handle: () => this.$emit("switchSettingsView", true),
          visible: this.isSettings,
        },
        {
          name: "Edit",
          locale: "uiComponents.deviceActions.edit",
          handle: () => {},
          visible: true,
        },
        {
          name: "Delete",
          locale: "uiComponents.deviceActions.delete",
          handle: () => {},
          visible: true,
        },
      ];
    },
    allDevices() {
      return [...this.mlModelIsSettings, ...this.devicesIsSettings];
    },
    /**
     * Defines for which devices preview show settings item
     */
    isSettings() {
      const map: any = new Map(this.allDevices);
      return map.get(this.deviceType);
    },
    mlModelIsSettings(): any {
      return this.$store.getters["mpc/mlModelIsSettings"];
    },
    devicesIsSettings(): any {
      return this.$store.getters["devices/devicesIsSettings"];
    },
  },
});
</script>

<style lang="scss" scoped></style>
