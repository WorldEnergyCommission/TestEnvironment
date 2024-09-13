<template>
  <CoreBreadcrumbs :items="breadcrumbs" class="pa-0">
    <template #item="{ item }">
      <CoreBreadcrumbsItem :disabled="item.disabled" :href="item.href">
        <span class="modularTextColor" style="font-size: 15px">{{ $t(item.text) }}</span>
      </CoreBreadcrumbsItem>
    </template>
    <template #divider>
      <CoreIcon>fas fa-angle-right</CoreIcon>
    </template>
  </CoreBreadcrumbs>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    const breadcrumbs: any = [];

    return {
      breadcrumbs,
    };
  },
  watch: {
    $route: [
      {
        handler: "onRouteChange",
      },
    ],
  },
  mounted() {
    this.initBreadcrumbs(this.$route);
  },
  methods: {
    /**
     * Creates breadcrumb object from route object
     * @param routerObj route
     */
    initBreadcrumbs(routerObj: any) {
      this.breadcrumbs = routerObj.matched.map((item: any) => ({
        text: item.meta.locale,
        disabled: false,
        href: `/#${item.path}`,
      }));
    },
    onRouteChange(route: any) {
      this.initBreadcrumbs(route);
    },
  },
});
</script>

<style lang="scss" scoped>
.modularTextColor {
  color: rgb(var(--v-theme-accent));
}
</style>
