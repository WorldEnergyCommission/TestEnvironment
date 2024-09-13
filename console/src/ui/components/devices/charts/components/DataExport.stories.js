import DataExportComponent from "./DataExport.vue";

export default {
  title: "Devices/Charts/DataExport",
  component: DataExportComponent,
};

export const DataExport = {
  args: {
    dataToExport: [
      {
        name: "File name",
        data: ["2024-02-28T00:00:00.000+01:00"],
      },
    ],
  },
};
