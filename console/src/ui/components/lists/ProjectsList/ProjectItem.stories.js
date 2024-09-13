import ProjectItemComponent from "./ProjectItem.vue";

export default {
  title: "Lists/ProjectsList/ProjectItem",
  component: ProjectItemComponent,
};

export const ProjectItem = {
  args: {
    project: {
      id: "project1",
      name: "Project 1",
      lat: 48.18941657201659,
      lon: 16.312922976415216,
      stats: {
        errors: 1,
        warnings: 1,
        devices: 20,
        members: 10,
      },
      meta: {
        description: "Description",
        hardwareId: "hardwareId",
        location: {
          display_name: "Location",
          lat: 48.18941657201659,
          lon: 16.312922976415216,
        },
      },
    },
  },
};
