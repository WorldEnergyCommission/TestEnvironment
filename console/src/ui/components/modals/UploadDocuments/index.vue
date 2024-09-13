<template>
  <EfficientIODialog :dialog-title="$t('uiComponents.buttons.addDocument')">
    <template #activator>
      <TopBarAddButton :text="$t('uiComponents.buttons.addDocument')" />
    </template>
    <template #content="{ hide, isActive }">
      <CoreContainer v-if="isActive" style="max-height: 80dvh">
        <CoreRow>
          <CoreColumn cols="12">
            <UploadDocumentsForm v-model="files" :multiple="true" :uploading="loading" />
          </CoreColumn>
          <CoreSpacer />
          <CoreColumn cols="12">
            <CoreTooltip location="top">
              <template #activator="{ props }">
                <div style="display: inline-block; float: right" v-bind="props">
                  <CoreButton
                    :loading="loading"
                    class="ml-3"
                    button-type="primary"
                    @click="() => upload().then(() => hide())"
                  >
                    {{ $t("uiComponents.buttons.send") }}
                    <template #iconRight>
                      <CoreIcon v-if="!loading" size="15"> mdi:mdi-upload </CoreIcon>
                    </template>
                  </CoreButton>
                </div>
              </template>
              <span> {{ $t("uiComponents.buttons.addDocument") }}</span>
            </CoreTooltip>
          </CoreColumn>
        </CoreRow>
      </CoreContainer>
    </template>
  </EfficientIODialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useStore } from "vuex";

import TopBarAddButton from "@/ui/components/components/TopBarAddButton.vue";
import EfficientIODialog from "@/ui/components/modals/EfficientIODialog.vue";
import UploadDocumentsForm from "@/ui/components/modals/UploadDocuments/UploadDocumentsForm.vue";

const loading = ref(false);
const files = ref([]);

const store = useStore();

async function upload() {
  loading.value = true;
  const promisises = [] as Promise<any>[];
  files.value.forEach((file) => {
    promisises.push(store.dispatch("projects/uploadDocument", file));
  });
  await Promise.allSettled(promisises);
  loading.value = false;
}
</script>
