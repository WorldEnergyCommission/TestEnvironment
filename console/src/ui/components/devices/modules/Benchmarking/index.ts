import { ref, onMounted, Ref } from "vue";

import api from "@/store/api";
import { IEvent } from "@/store/modules/events/types";

export function useAlertSummary(projectIDs?: string[] | Ref<string[]>) {
  const alertSummary = ref<IEvent[] | null>(null);
  const isFetching = ref(false);
  const _projectIDs = ref(projectIDs);

  async function fetchAlertSummary() {
    try {
      isFetching.value = true;
      const response = await api.fetch("/alerts/summary", "POST", _projectIDs.value ?? []);
      alertSummary.value = response;
    } catch (error) {
      console.error("Failed to fetch alert summary:", error);
    } finally {
      isFetching.value = false;
    }
  }

  onMounted(fetchAlertSummary);

  return {
    alertSummary,
    isFetching,
    fetchAlertSummary,
  };
}
