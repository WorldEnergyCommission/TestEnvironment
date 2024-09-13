export const projects = {
  namespaced: true,
  state: {
    projectId: "projectId",
    project: {
      id: "Project",
      name: "Project name",
      meta: {
        location: {
          display_name: "Location",
        },
      },
      connectivity: {
        actions: [
          {
            type: "email",
            params: {
              recipients: ["example@mail.com"],
              subject: "{{name}}",
              body: "Report from {{start}} to {{end}}",
            },
          },
        ],
      },
    },
    lastHeartbeatMessage: new Date().getTime() - 1000000000,
    projectsFilter: "search",
  },
  getters: {
    projects() {
      return [
        {
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
            imageId: "8c57cfe9-d40d-4bf2-8403-ec2b66cc841a",
            location: {
              display_name: "Location",
              lat: 48.18941657201659,
              lon: 16.312922976415216,
            },
          },
        },
      ];
    },
    isDnDActive() {
      return true;
    },
    setProjectFilter(name: string) {
      console.log("setProjectFilter", name);
    },
  },
  actions: {
    updateProject() {
      console.log("updateProject");
      return Promise.resolve();
    },
    loadProjects() {
      console.log("loadProjects");
      return Promise.resolve();
    },
    createProject() {
      console.log("createProject");
      return Promise.resolve();
    },
  },
  mutations: {
    setProjectStatus() {
      console.log("setProjectStatus");
    },
    setProjectFilter() {
      console.log("setProjectFilter");
    },
  },
};
