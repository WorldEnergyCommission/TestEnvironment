<template>
  <CoreCard
    :height="height"
    :to="projectPath"
    class="project-item d-flex justify-space-between flex-column"
    link
    elevated-card
    card-with-bg-color
  >
    <!-- Image on top (not shown on mobile)-->
    <div v-if="!$vuetify.display.mdAndDown" class="image py-3 px-3">
      <ProjectItemImage :height="styles.image" :image-id="project.meta.imageId" />
    </div>
    <CoreRow>
      <CoreColumn cols="8" lg="12" class="d-flex justify-space-between flex-column">
        <!-- name -->
        <CoreCardTitle class="text-h6">
          {{ project.name }}
        </CoreCardTitle>
        <!-- description -->
        <CoreCardSubtitle>{{ project.meta.description }}</CoreCardSubtitle>
        <!-- hardwareId -->
        <CoreCardSubtitle v-if="project.meta.hardwareId">
          <lynus-icon :size="styles.icon" name="fa-barcode" />
          {{ project.meta.hardwareId }}
        </CoreCardSubtitle>
        <!-- location -->
        <CoreCardText v-if="!$vuetify.display.mdAndDown && projectCity !== ''">
          <lynus-icon :size="styles.icon - 3" name="fa-location-dot" />
          {{ projectCity }}
        </CoreCardText>
        <CoreCardSubtitle v-if="$vuetify.display.mdAndDown && projectCity !== ''">
          <lynus-icon :size="styles.icon" name="fa-location-dot" />
          {{ projectCity }}
        </CoreCardSubtitle>
        <!-- info of project -->
        <CoreCardText
          v-if="showProjectInfo"
          style="gap: 5px"
          class="d-flex flex-column-reverse pt-0"
        >
          <ProjectItemStatusIcons
            :devices-count="devicesCount"
            :icon="statusIcons[status[1]].icon"
            :icon-color-name="statusIcons[status[1]].lynusIconColor"
            :members-count="membersCount"
            :size="styles.status"
          />
        </CoreCardText>
      </CoreColumn>
      <!-- on Mobile use v-list-item-avatar to position image -->
      <CoreColumn
        v-if="$vuetify.display.mdAndDown"
        cols="4"
        class="d-flex align-center justify-center"
      >
        <CoreAvatar rounded="0" class="ma-3" :size="$vuetify.display.name == 'md' ? 70 : 60">
          <ProjectItemImage :height="styles.image" :image-id="project.meta.imageId" />
        </CoreAvatar>
      </CoreColumn>
    </CoreRow>
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import ProjectItemImage from "./ProjectItemImage.vue";
import ProjectItemStatusIcons from "./ProjectItemStatusIcons.vue";
import { IProject } from "@/store/modules/projects/types";
import { envShowProjectInfo } from "@/utils/env";
import { getProjectPath } from "@/utils/PathUtils";

/**
 * Component that represent project in project-list
 */
export default defineComponent({
  components: {
    ProjectItemImage,
    ProjectItemStatusIcons,
  },
  props: {
    project: { default: null, type: Object as PropType<IProject> },
    height: { default: 245, type: Number },
  },
  data() {
    const showProjectInfo: boolean = envShowProjectInfo;

    return {
      showProjectInfo,
    };
  },
  computed: {
    /**
     * Defines current project city name
     * @return {string} city name
     */
    projectCity() {
      if (
        this.project &&
        this.project.meta &&
        this.project.meta.location &&
        (this.project.meta.location as any).display_name
      ) {
        return (this.project.meta.location as any).display_name.split(",")[0];
      }
      return "";
    },
    projectPath() {
      return getProjectPath(this.project.id);
    },
    /**
     * Define project image, icons sizes according to window size
     * @return {object} image, icons sizes
     */
    styles() {
      const lg = {
        image: 190,
        icon: 14,
        status: 18,
      };
      const md = {
        image: 60,
        icon: 14,
        status: 18,
      };
      const sm = {
        image: 60,
        icon: 12,
        status: 18,
      };
      switch (this.$vuetify.display.name) {
        case "xs":
          return sm;
        case "sm":
          return sm;
        case "md":
          return md;
        case "lg":
          return lg;
        case "xl":
          return lg;
        default:
          return lg;
      }
    },
    devicesCount() {
      return this.project?.stats?.devices;
    },
    membersCount() {
      return this.project?.stats?.members;
    },
    statusIcons() {
      return {
        ok: {
          icon: "ok",
          text: "ok",
          color: "green",
          lynusIconColor: "green",
        },
        warning: {
          icon: "warning",
          text: "warning",
          color: "yellow",
          lynusIconColor: "warning",
        },
        error: {
          icon: "fault",
          text: "error",
          color: "red",
          lynusIconColor: "red",
        },
      };
    },
    /**
     * Checks projects warnings, errors and define status according to them
     * @return {array} current status
     */
    status() {
      const { errors, warnings } = this.project?.stats as any;
      const arr: [meta: any, type: "ok" | "warning" | "error"][] = [
        [errors, "error"],
        [warnings, "warning"],
      ];
      return arr.find((el: any) => el[0]) || [null, "ok"];
    },
  },
});
</script>

<style lang="scss" scoped>
.project-item-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 0 10px;
  font-size: 20px;
  font-weight: 500;
  @media (min-width: 960px) and (max-width: 1264px) {
    font-size: 13px;
    padding: 0 0 5px;
  }
  @media (max-width: 960px) {
    font-size: 10px;
    padding: 0 0 5px;
  }
}

.image {
  overflow: hidden;
  border-radius: 12px !important;
  display: flex;
  align-content: center;
  justify-content: center;
  max-height: 190px;
  @media (min-width: 960px) and (max-width: 1264px) {
    border-radius: 13px !important;
    max-height: 110px;
  }
  @media (max-width: 960px) {
  }
}
</style>
