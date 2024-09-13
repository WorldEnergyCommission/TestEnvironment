<template>
  <div class="curved-display-margin-bottom">
    <CoreSlideYTransition mode="out-in">
      <CoreRow v-if="breadcrumb">
        <CoreBreadcrumbs
          :items="[{ title: 'Workbench', to: { name: 'Workbench-navigation' } }, breadcrumb]"
        >
          <template #divider>
            <CoreIcon icon="mdi:mdi-chevron-right" />
          </template>
        </CoreBreadcrumbs>
      </CoreRow>
    </CoreSlideYTransition>
    <CoreRow>
      <router-view v-slot="{ Component }">
        <transition>
          <CoreSlideXTransition mode="out-in">
            <component :is="Component" />
          </CoreSlideXTransition>
        </transition>
      </router-view>
    </CoreRow>
  </div>
</template>
<script lang="ts">
export default {
  name: "Worbench",
};
</script>

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

const route = useRoute();

const store = useStore();
onMounted(() => {
  store.dispatch("rooms/fetchRooms", route.params.id);
});

const { t } = useI18n();

// a computed ref
const breadcrumb = computed(() => {
  if (!route.meta?.breadcrumb) return;
  return t(route.meta?.breadcrumb);
});
</script>
