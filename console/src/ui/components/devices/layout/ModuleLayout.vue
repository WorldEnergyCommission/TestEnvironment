<template>
  <DeviceCardWrapper>
    <template v-if="moduleData" #title>
      {{ moduleData?.name }}
    </template>

    <template #content>
      <div class="ms-auto">
        <CoreMenu v-model="isMenuOpen" location="bottom start">
          <template #activator="{ props }">
            <CoreButton button-type="standardIcon" v-bind="props">
              <CoreIcon>fas fa-ellipsis-v</CoreIcon>
            </CoreButton>
          </template>

          <CoreList class="module-actions">
            <CoreListItem link>
              <ManageModuleForm :device="moduleData">
                <template #activator>
                  <div class="module-actions-item">
                    {{ $t("modules.edit") }}
                  </div>
                </template>
              </ManageModuleForm>
            </CoreListItem>
            <CoreListItem link>
              <DeleteModalForm
                :deleted-item-name="moduleData.name"
                color="accent"
                @delete-handler="removeFromCollection(moduleData.id)"
              >
                <div class="module-actions-item">
                  {{ $t("modules.delete") }}
                </div>
              </DeleteModalForm>
            </CoreListItem>
          </CoreList>
        </CoreMenu>
      </div>
      <slot />
      <!-- drag and drop button, need to move device in dnd grid -->
      <div class="pt-2 d-flex justify-end">
        <slot name="dnd" />
      </div>
    </template>
  </DeviceCardWrapper>
</template>
<script lang="ts" setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";

import api from "@/store/api";
import { ModuleType } from "@/store/modules/modules/types";
import DeviceCardWrapper from "@/ui/components/devices/layout/DeviceCardWrapper";
import DeleteModalForm from "@/ui/components/modals/DeleteModalForm.vue";
import ManageModuleForm from "@/ui/components/modals/Modules/ManageModule.vue";

const isMenuOpen = ref(false);

const props = defineProps<{ moduleData: ModuleType }>();

const store = useStore();
const projectId = computed(() => store.state.projects.projectId);

async function removeFromCollection(id: string) {
  //loading.value = true;
  try {
    const response = await api.fetch(
      `/projects/${projectId.value}/modules/${id}/collection`,
      "DELETE",
    );
  } catch (e: any) {
    store.commit("app/setReport", {
      type: "error",
      message: e?.message,
      value: true,
    });
  } finally {
    store.dispatch("modules/fetchModulesWihtMappings");
    // loading.value = false;
  }
}
</script>
<style lang="scss" scoped>
@import "./CommonDeviceLayoutStyling";

.module-actions-item {
  @extend .common-device-actions-item;
}

.module-actions {
  @extend .common-device-actions;
}
</style>
