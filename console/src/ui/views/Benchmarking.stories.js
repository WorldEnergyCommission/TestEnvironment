import BenchmarkingComponent from "./Benchmarking.vue";

export default {
  title: "Views/Benchmarking",
  component: BenchmarkingComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.efficientio.io/v1/projects/project1/modules/report?tz=Europe/Warsaw",
        method: "GET",
        status: 200,
        response: {
          project1: {
            name: "Project",
            id: "project1",
          },
        },
      },
    ],
  },
};

export const Benchmarking = {
  args: {},
};
