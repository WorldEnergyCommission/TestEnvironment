import { onMounted, computed, ref, watch, Ref, reactive } from "vue";
import { useStore } from "vuex";

import ReportModuleBody from "./Body.vue";
import { useProjects } from "@/composables/useProjects";
import api from "@/store/api";
import { IProject } from "@/store/modules/projects/types";
import { envWorkbenchCategories } from "@/utils/env";
import { getGuessedTimezoneAbbreviation } from "@/utils/utilsFunctions";
import { validate } from "uuid";
import { store } from "@/store";
import { cloneDeep } from "lodash";

type ReportModuleDataType = {
  live?: { grid: string[]; pv: string[]; battery_soc: string[]; cs: string[] };
  today?: {
    pv?: number;
    trees_planted?: number;
    co2_saved?: number;
    coal_saved?: number;
    grid_consumption?: number;
    grid_feed_in?: number;
    electricity_cost?: number;
    electricity_earnings?: number;
    cs?: number;
    cs_earnings?: number;
    cs_state_cycles?: number;
  };
  week?: {
    pv?: Record<string, number>;
    grid_consumption?: Record<string, number>;
    grid_feed_in?: Record<string, number>;
    autarchy?: Record<string, number>;
    cs_state?: Record<string, number>;
    cs?: Record<string, number>;
  };
  autarchy?: number;
  valid?: boolean;
};

type useReportModuleDataType = {
  reportModuleData: Ref<ReportModuleDataType>;
  isFetching: Ref<boolean>;
  fetchReport: () => Promise<void>;
};

const useReportModuleData = (
  projectID: string | Ref<string>,
): useReportModuleDataType & { enabled: boolean } => {
  const _projectId = ref(projectID);
  const reportModuleData = ref({} as ReportModuleDataType);
  const isFetching = ref(true);
  const store = useStore();

  const enabled = envWorkbenchCategories.map((item) => item.toLowerCase()).includes("datamappings");

  /** fetch automatic report module from api */
  async function fetchReport() {
    if (!enabled) return;
    try {
      isFetching.value = true;
      const response = await api.fetch(
        `/projects/${_projectId.value}/modules/report?tz=${getGuessedTimezoneAbbreviation()}`,
        "GET",
      );
      reportModuleData.value = response;
    } catch (e: any) {
      store.commit("app/setReport", {
        type: "error",
        message: e?.message,
        value: true,
      });
    } finally {
      isFetching.value = false;
    }
  }

  watch(_projectId, fetchReport);
  onMounted(fetchReport);

  return { reportModuleData, isFetching, fetchReport, enabled };
};

type BenchmarkChartDataDataType = Record<string, useReportModuleDataType>;

type useBenchmarkChartDataDataType = BenchmarkChartDataDataType | Ref<BenchmarkChartDataDataType>;

const useBenchmarkChartData = (data: useBenchmarkChartDataDataType, key: string) => {
  const _data = ref(data);
  const { projects } = useProjects();

  return computed(() => {
    let chart_data = [] as Record<string, number>[];
    let titles = [] as string[];
    let types = [] as string[];
    let axisis = [] as string[];
    _data.value &&
      Object.entries(_data.value).forEach(([id, benchmark_project]) => {
        if (benchmark_project.week && benchmark_project.week[key]) {
          chart_data = [...chart_data, benchmark_project.week[key]];
          const tmp = projects.value.find((project) => project.id == id);
          titles = [...titles, tmp?.name ?? "-"];
          types = [...types, "bar"];
          axisis = [...axisis, "1"];
        }
      });

    return { chart_data, titles, types, axisis };
  });
};

const useBenchmarkTodayData = (data: useBenchmarkChartDataDataType) => {
  const _data = ref(data);

  return computed(() => {
    let pv = 0;
    let trees_planted = 0;
    let co2_saved = 0;
    let coal_saved = 0;
    let grid_consumption = 0;
    let grid_feed_in = 0;
    let electricity_cost = 0;
    let electricity_earnings = 0;

    _data.value &&
      Object.entries(_data.value).forEach(([id, benchmark_project]) => {
        pv += benchmark_project.today?.pv ? benchmark_project.today?.pv : 0;
        trees_planted += benchmark_project.today?.trees_planted
          ? benchmark_project.today?.trees_planted
          : 0;
        co2_saved += benchmark_project.today?.co2_saved ? benchmark_project.today?.co2_saved : 0;
        coal_saved += benchmark_project.today?.coal_saved ? benchmark_project.today?.coal_saved : 0;
        grid_consumption += benchmark_project.today?.grid_consumption
          ? benchmark_project.today?.grid_consumption
          : 0;
        grid_feed_in += benchmark_project.today?.grid_feed_in
          ? benchmark_project.today?.grid_feed_in
          : 0;
        electricity_cost += benchmark_project.today?.electricity_cost
          ? benchmark_project.today?.electricity_cost
          : 0;
        electricity_earnings += benchmark_project.today?.electricity_earnings
          ? benchmark_project.today?.electricity_earnings
          : 0;
      });

    return {
      pv,
      trees_planted,
      co2_saved,
      coal_saved,
      grid_consumption,
      grid_feed_in,
      electricity_cost,
      electricity_earnings,
    };
  });
};

const useBenchmarkWeekData = (data: useBenchmarkChartDataDataType) => {
  const _data = ref(data);

  return computed(() => {
    const pv = {} as Record<number, number>;
    const grid_consumption = {} as Record<number, number>;
    const grid_feed_in = {} as Record<number, number>;

    _data.value &&
      Object.entries(_data.value).forEach(([id, benchmark_project]) => {
        if (benchmark_project.week?.pv) {
          Object.entries(benchmark_project.week?.pv).forEach(([date, value]) => {
            pv[date] = pv[date] ? pv[date] + value : value;
          });
        }
        if (benchmark_project.week?.grid_consumption) {
          Object.entries(benchmark_project.week?.grid_consumption).forEach(([date, value]) => {
            grid_consumption[date] = grid_consumption[date]
              ? grid_consumption[date] + value
              : value;
          });
        }
        if (benchmark_project.week?.grid_feed_in) {
          Object.entries(benchmark_project.week?.grid_feed_in).forEach(([date, value]) => {
            grid_feed_in[date] = grid_feed_in[date] ? grid_feed_in[date] + value : value;
          });
        }
      });

    return {
      pv,
      grid_consumption,
      grid_feed_in,
    };
  });
};
const useBenchmarkLiveData = (data: useBenchmarkChartDataDataType) => {
  const _data = ref(data);

  return computed(() => {
    let pv = [] as string[];
    let grid = [] as string[];
    let battery_soc = [] as string[];

    _data.value &&
      Object.entries(_data.value).forEach(([project_id, benchmark_project]) => {
        if (benchmark_project.live?.pv) {
          pv = [
            ...pv,
            ...benchmark_project.live?.pv.map(
              (measurement_key: string) => `${project_id}:${measurement_key}`,
            ),
          ];
        }
        if (benchmark_project.live?.grid) {
          grid = [
            ...grid,
            ...benchmark_project.live?.grid.map(
              (measurement_key: string) => `${project_id}:${measurement_key}`,
            ),
          ];
        }
        if (benchmark_project.live?.battery_soc) {
          battery_soc = [
            ...battery_soc,
            ...benchmark_project.live?.battery_soc.map(
              (measurement_key: string) => `${project_id}:${measurement_key}`,
            ),
          ];
        }
      });

    return {
      pv,
      grid,
      battery_soc,
    };
  });
};

function useBenchmarkProjects() {
  const { projects } = useProjects();
  const selectedProjects = ref<IProject[]>([]);
  const data = ref<BenchmarkChartDataDataType>({});
  const isFetching = ref(false);

  /** fetch automatic report module from api */
  async function fetchReports() {
    try {
      isFetching.value = true;
      const response = await api.fetch(
        `/benchmarking/report?tz=${getGuessedTimezoneAbbreviation()}`,
        "POST",
        selectedProjects.value.map((project) => project.id),
      );
      data.value = cloneDeep(response);
    } catch (e: any) {
      store.commit("app/setReport", {
        type: "error",
        message: e?.message,
        value: true,
      });
    } finally {
      isFetching.value = false;
    }
  }

  return { projects, selectedProjects, data, fetchData: fetchReports, isFetching };
}

export {
  ReportModuleBody,
  ReportModuleDataType,
  BenchmarkChartDataDataType,
  useReportModuleData,
  useBenchmarkChartData,
  useBenchmarkProjects,
  useBenchmarkTodayData,
  useBenchmarkWeekData,
  useBenchmarkLiveData,
};
