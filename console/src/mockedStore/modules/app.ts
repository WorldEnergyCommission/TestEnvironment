export const app = {
  namespaced: true,
  state: {
    auth: {
      accessToken: "",
    },
    reportBox: {
      value: true,
    },
    weatherData: {
      main: {
        temp: 10,
        humidity: 60,
      },
      wind: {
        speed: 10,
      },
      weather: [
        {
          icon: "02",
        },
      ],
    },
    weatherForecastData: {
      list: [
        {
          weather: [
            {
              icon: "01",
            },
          ],
          main: {
            temp: 10,
          },
          dt: 1708671600000,
        },
        {
          weather: [
            {
              icon: "06n",
            },
          ],
          main: {
            temp: 12,
          },
          dt: 1708686000000,
        },
        {
          weather: [
            {
              icon: "10",
            },
          ],
          main: {
            temp: 13,
          },
          dt: 1708700400000,
        },
        {
          weather: [
            {
              icon: "11",
            },
          ],
          main: {
            temp: 10,
          },
          dt: 1708714800000,
        },
      ],
    },
    user: {
      id: 0,
      last_name: "Last name",
      first_name: "First name",
    },
  },
  getters: {
    getReportMessageAndType() {
      return {
        message: "Message",
        type: "warning",
      };
    },
    getUser() {
      return {
        id: "userId",
        email: "email@email.com",
        first_name: "First name",
        last_name: "Last name",
        role: "admin",
        owner: true,
      };
    },
  },
  actions: {
    clear() {
      console.log("clear");
      return Promise.resolve();
    },
    fetchWeatherForecast() {
      console.log("fetchWeatherForecast");
      return Promise.resolve();
    },
    fetchWeather() {
      console.log("fetchWeather");
      return Promise.resolve();
    },
    deleteFile() {
      console.log("deleteFile");
      return Promise.resolve();
    },
    loadFiles() {
      console.log("loadFiles");
      return Promise.resolve([
        {
          name: "File 1",
          id: "file1",
          size: "20MB",
          content_type: "Type",
          created_at: "",
          href: "/",
        },
      ]);
    },
  },
  mutations: {
    setReport() {
      console.log("setReport");
    },
    setEventListFilter(name: string) {
      console.log("setEventListFilter", name);
    },
    setWorkbenchTab() {
      console.log("setWorkbenchTab");
    },
  },
};
