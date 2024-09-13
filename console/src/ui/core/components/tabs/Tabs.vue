<template>
  <div class="tab-wrapper">
    <v-tabs v-bind="$attrs" bg-color="transparent" color="accent">
      <slot />
    </v-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CoreTabs",
});
</script>

<style lang="scss">
.v-tabs.tabs-with-space {
  margin: 0px 20px;
}

.v-slide-group__prev {
  margin-left: -15px;
}

.v-slide-group__next {
  margin-right: -15px;
}

.tab-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.v-theme--light {
  .v-tabs .v-slide-group__content {
    background: rgb(var(--v-theme-secondaryDeviceBackground-lighten-1));
  }
}

.v-tabs {
  .v-slide-group__content {
    background: rgb(var(--v-theme-primary-lighten-1));
    border-radius: 24px;
    flex: none !important;
    box-shadow:
      0px 2px 1px -1px rgba(0, 0, 0, 0.2),
      0px 1px 1px 0px rgba(0, 0, 0, 0.14),
      0px 1px 3px 0px rgba(0, 0, 0, 0.12);
    margin-bottom: 5px;
    overflow: hidden;
    margin-right: 2px;

    .v-tab.v-tab.v-btn {
      height: calc(var(--v-tabs-height) - 5px);
    }

    .v-tab--selected {
      background: rgb(var(--v-theme-accent));

      .v-btn__content {
        color: rgb(var(--v-theme-on-accent));
      }

      .v-tab__slider {
        height: 0px;
      }
    }
  }
}
</style>
