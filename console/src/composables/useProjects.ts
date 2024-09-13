import { onMounted, computed } from "vue";
import { useStore } from "vuex";

import { IProject } from "@/store/modules/projects/types";

const useProjects = () => {
  const store = useStore();
  onMounted(() => store.dispatch("projects/loadProjects"));
  const projects = computed(() => store.getters["projects/projects"] as IProject[]);

  return { projects };
};

export { useProjects };
