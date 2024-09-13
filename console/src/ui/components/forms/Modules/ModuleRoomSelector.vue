<template>
  <div class="d-flex flex-row align-center">
    <CoreSelect
      v-model="val"
      item-title="name"
      item-value="id"
      :items="rooms"
      variant="plain"
      hide-details
      @update:model-value="didChange = true"
    />
    <CoreButton
      button-type="standardIcon"
      icon="mdi:mdi-check"
      :disabled="!didChange"
      :loading="loading"
      @click="postNewRoomSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from "vuex";

import api from "@/store/api";

const props = defineProps({
  moduleId: String,
  roomId: String,
});

const emit = defineEmits(["saved", "update:moduleId"]);

const collection = ref<string>();

const val = computed({
  get() {
    return collection.value || props.roomId;
  },
  set(value) {
    collection.value = value;
    emit("update:moduleId", value);
  },
});

const store = useStore();

const didChange = ref(false);
const loading = ref(false);

const rooms = computed(() => store.getters["rooms/rooms"]);
const projectId = computed(() => store.state.projects.projectId);

async function postNewRoomSelection() {
  loading.value = true;
  try {
    const response = await api.fetch(
      `/projects/${projectId.value}/modules/${props.moduleId}/collection`,
      "PUT",
      {
        collection_id: collection.value,
      },
    );
    emit("saved", response);
    didChange.value = false;
  } catch (e: any) {
    store.commit("app/setReport", {
      type: "error",
      message: e?.message,
      value: true,
    });
  } finally {
    loading.value = false;
  }
}
</script>
