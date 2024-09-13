import ProjectItemStatusIconsComponent from "./ProjectItemStatusIcons.vue";

export default {
  title: "Lists/ProjectsList/ProjectItemStatusIcons",
  component: ProjectItemStatusIconsComponent,
};

export const ProjectItemStatusIcons = {
  args: {
    icon: "trash",
    membersCount: 10,
    devicesCount: 20,
  },
};
