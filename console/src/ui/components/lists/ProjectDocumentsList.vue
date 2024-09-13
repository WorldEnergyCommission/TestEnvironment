<template>
  <CoreContainer fluid>
    <CoreRow>
      <CoreColumn class="px-0 downloads-list">
        <CoreExpansionPanels variant="inset">
          <CoreExpansionPanel
            v-for="(item, index) in files"
            :key="index"
            class="downloads-list-item"
          >
            <CoreExpansionPanelTitle class="downloads-list-item-header">
              {{ item.name }}
            </CoreExpansionPanelTitle>
            <CoreExpansionPanelText class="downloads-list-item-content">
              <div>id: {{ item.id }}</div>
              <div>size: {{ formatBytes(item.size) }}</div>
              <div>type: {{ item.content_type }}</div>
              <div>created at: {{ formatDate(new Date(item.created_at)) }}</div>
              <div class="buttons">
                <CoreButton :href="item.href" class="mr-2" download link button-type="primary">
                  <template #icon>
                    <lynus-icon color="accent" name="download" size="15" />
                  </template>
                  {{ $t("uiComponents.buttons.download") }}
                </CoreButton>
                <DeleteButton
                  :disabled="!hasCurrentMemberScopedPermission('deleteDocument', item.id)"
                  @click="deleteProjectFile(item.id)"
                />
              </div>
            </CoreExpansionPanelText>
          </CoreExpansionPanel>
        </CoreExpansionPanels>
      </CoreColumn>
    </CoreRow>
  </CoreContainer>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";

import { RootState } from "@/store/types";
import DeleteButton from "@/ui/components/components/buttons/DeleteButton.vue";
import { formatBytes, formatDate } from "@/utils/utilsFunctions.ts";

const store = useStore();

const loading = ref(false);
onMounted(async () => {
  loading.value = true;
  await store.dispatch("projects/loadFiles");
  loading.value = false;
});
const files = computed(() => {
  return (store.state as RootState).projects.documents;
});

async function deleteProjectFile(fileId: any) {
  await store.dispatch("app/deleteFile", fileId);
  await store.dispatch("projects/loadFiles");
}

function hasCurrentMemberScopedPermission(): (permission: string, scope: string) => boolean {
  return store.getters["members/hasScopedPermission"];
}
</script>
<style lang="scss">
.downloads-list {
  .downloads-list-item {
    .downloads-list-item-header {
      font-size: 20px;
      line-height: 1;
    }

    .downloads-list-item-content {
      font-size: 15px;

      .buttons {
        margin-top: 20px;
      }

      div {
        margin-top: 10px;

        &:first-of-type {
          margin-top: 0;
        }
      }
    }
  }
}
</style>
