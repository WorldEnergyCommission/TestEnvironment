<template>
  <div v-if="!getShouldForward" class="pa-5 bottom-without-safe">
    <HomeTopContent />
    <ProjectsList class="curved-display-margin-bottom" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { IProject } from "@/store/modules/projects/types";
import HomeTopContent from "@/ui/components/components/HomeTopContent.vue";
import ProjectsList from "@/ui/components/lists/ProjectsList/index.vue";
import { Auth } from "@/utils/Auth";
import { getProjectPath } from "@/utils/PathUtils";

/**
 * Home page that shows projects
 */
export default defineComponent({
  components: {
    ProjectsList,
    HomeTopContent,
  },
  computed: {
    projects(): IProject[] {
      return this.$store.getters["projects/projects"];
    },
    getShouldForward(): boolean {
      return this.$store.getters["app/getShouldForward"];
    },
  },
  async mounted() {
    if (!Auth.didInitialize || !this.$store.getters["app/isLoggedIn"]) return;
    await this.$store.dispatch("projects/loadProjects");
    if (this.projects.length == 1 && this.getShouldForward) {
      const singleProjectId = this.projects[0].id;
      this.setShouldForward(false);
      await this.$router.push(getProjectPath(singleProjectId));
    } else {
      this.setShouldForward(false);
    }
  },
  methods: {
    setShouldForward(payload: boolean) {
      this.$store.commit("app/setShouldForward", payload);
    },
  },
});
</script>
