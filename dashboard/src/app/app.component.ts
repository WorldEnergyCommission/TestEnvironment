import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserData } from 'src/data-types/userData';
import { UserDataService } from './services/user-data.service';
import { ModuleDataService } from './services/module-data.service';
import {
  ModuleData,
  OutdoorWeather,
  Project,
  ReportMeasurements,
} from 'src/data-types/moduleData';
import { combineLatest, Observable, switchMap } from 'rxjs';
import { TokenService } from './services/token.service';
import * as moment from 'moment';
import 'moment-timezone';
import { ProjectReport } from 'src/data-types/report';
import { ChartParams } from 'src/data-types/chartParams';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  module = '';
  authKey = '';
  username = '';
  password = '';
  project = '';
  token = '';
  userData?: UserData;
  interval: any;
  error = false;

  private reports: Record<string, ProjectReport> = {};

  constructor(
    private route: ActivatedRoute,
    private userDataService: UserDataService,
    private moduleDataService: ModuleDataService,
    private tokenService: TokenService,
    private cdf: ChangeDetectorRef
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params) {
        if (params['module']) {
          this.module = params['module'];
        }
        if (params['project_id']) {
          this.project = params['project_id'];
        }
        if (params['username']) {
          this.username = params['username'];
        }
        if (params['password']) {
          this.password = params['password'];
        }
        this.init();
      }
    });
  }

  init(): void {
    if (this.project && this.username && this.password) {
      this.userDataService.getCustomers().subscribe((customers: any) => {
        const customer = customers[this.project];
        if (customer) {
          this.userDataService.getUserData(customer).subscribe((userData) => {
            if (userData) {
              this.userData = userData;
              this.refreshData();

              this.interval = setInterval(() => {
                this.refreshData();
              }, 60000 * 5);
            }
          });
        } else {
          this.error = true;
        }
      });
    }
  }

  refreshData(): void {
    if (this.userData) {
      this.tokenService
        .getAccessToken(this.username, this.password, this.userData)
        .subscribe({
          next: (tokenInfo) => {
            this.token = tokenInfo.access_token;
            if (this.userData && this.token) {
              this.getMeasurementsForCurrentProject(this.token);
              this.calculateChargedEnergy(this.token);
              this.calculatePvPower(this.token);
              this.setOutdoorTemperature(this.token);
            }
          },
          error: (err) => {
            this.error = true;
            this.cdf.detectChanges();
          },
        });
    }
  }

  private getMeasurementsForCurrentProject(token: string) {
    if (this.userData) {
      this.moduleDataService
        .getAllMeasurements(this.userData, token)
        .subscribe((measurements) => {
          if (measurements) {
            const data: ModuleData = {};
            data.pv_aggregated_current_power = this.getMeasurementsSum(
              measurements,
              this.userData?.pv_power
            );
            data.pv_aggregated_produced_energy_prediction_next_day =
              this.getMeasurementsSum(
                measurements,
                this.userData?.pv_aggregated_produced_energy_prediction_next_day
              );
            data.ws_average_room_humidity = this.getMeasurementsAverage(
              measurements,
              this.userData?.ws_average_room_humidity
            );
            data.ws_average_room_temperature = this.getMeasurementsAverage(
              measurements,
              this.userData?.ws_average_room_temperature
            );
            data.cs_aggregated_current_connected_cars =
              this.getNumberOfLoadingCars(measurements);

            data.otherVars = measurements;
            this.moduleDataService.sendNewData(data);
            this.getReportData(this.token, measurements);
            this.cdf.detectChanges();
          }
        });
    }
  }

  private getReportData(
    token: string,
    measurementsForCurrentProject: any
  ): void {
    if (this.userData) {
      if (this.userData.should_sum_up_all_projects) {
        this.getReportsForAllProjects(token, measurementsForCurrentProject);
      } else {
        this.getReportForCurrentProject(token, measurementsForCurrentProject);
      }
    }
  }

  private getReportsForAllProjects(
    token: string,
    measurementsForCurrentProject: any
  ) {
    if (this.userData) {
      this.moduleDataService
        .getProjects(this.userData, token)
        .pipe(
          switchMap((projects: Project[]) => {
            const projectIds = projects.map((project) => project.id);
            this.setReportStats(projects);
            return this.moduleDataService.getReports(
              this.userData as UserData,
              this.token,
              projectIds
            );
          })
        )
        .subscribe((reports) => {
          this.reports = reports;
          if (this.userData) {
            this.setReportData(measurementsForCurrentProject);
          }
        });
    }
  }

  private setReportStats(projects: Project[]) {
    this.moduleDataService.sendNewData({
      project_state: {
        total: projects.length,
        errors: projects.filter((project) => project.stats.errors).length,
        warnings: projects.filter(
          (project) => !project.stats.errors && project.stats.warnings
        ).length,
        noErrors: projects.filter(
          (project) => !project.stats.errors && !project.stats.warnings
        ).length,
      },
    });
  }

  private getReportForCurrentProject(
    token: string,
    measurements: Record<string, number>
  ): void {
    if (this.userData) {
      this.moduleDataService
        .getProjectReport(this.userData, token)
        .subscribe((report: ProjectReport) => {
          if (this.userData && report) {
            this.moduleDataService.sendNewData({
              rp_live_variables: {
                battery_soc: report.live?.battery_soc,
                grid: report.live?.grid,
                pv: report.live?.pv,
              },
              report_for_current_project: this.mapReportsForOneProject(
                report,
                measurements
              ),
            });
          }
        });
    }
  }

  private getSumOfVariablesFromMeasurements(
    variables: string[] | undefined,
    measurements: Record<string, number>
  ) {
    return (
      variables?.reduce(
        (sum, measurement) => sum + measurements[measurement] ?? 0,
        0
      ) ?? 0
    );
  }

  private mapReportsForOneProject(
    report: ProjectReport,
    measurements: Record<string, number>
  ): ReportMeasurements {
    let result: ReportMeasurements = {};

    if (measurements) {
      result = {
        autarchy: report.autarchy,
        live: {
          battery_soc: this.getSumOfVariablesFromMeasurements(
            report.live?.battery_soc,
            measurements
          ),
          grid: this.getSumOfVariablesFromMeasurements(
            report.live?.grid,
            measurements
          ),
          pv: this.getSumOfVariablesFromMeasurements(
            report.live?.grid,
            measurements
          ),
        },
        today: {
          co2_saved: report.today?.co2_saved,
          coal_saved: report.today?.coal_saved,
          electricity_cost: report.today?.electricity_cost,
          electricity_earnings: report.today?.electricity_earnings,
          grid_consumption: report.today?.grid_consumption,
          grid_feed_in: report.today?.grid_feed_in,
          pv: report.today?.pv,
          trees_planted: report.today?.trees_planted,
        },
        valid: report.valid,
        week: {
          autarchy: report.week?.autarchy,
          grid_consumption: report.week?.grid_consumption,
          grid_feed_in: report.week?.grid_feed_in,
          pv: report.week?.pv,
        },
      };
    }

    return result;
  }

  private sum(sum?: number, value?: number): number | undefined {
    return value ? value + (sum ?? 0) : sum;
  }

  private sumForWeekMeasurements(
    sum?: { [key: string]: number },
    value?: { [key: string]: number }
  ) {
    if (value) {
      Object.entries(value).map(([key, measurement]) => {
        if (sum?.[key]) {
          sum[key] = measurement + sum[key];
        } else {
          sum = {
            ...sum,
            [key]: measurement,
          };
        }
      });
    }

    return sum;
  }

  private sumUpForAllProjects(allVariables: ReportMeasurements[]) {
    const report_for_all_projects = allVariables.reduce((sum, report) => {
      sum.autarchy = this.sum(sum.autarchy, report.autarchy);
      if (report.live) {
        sum.live = {
          battery_soc: this.sum(sum.live?.battery_soc, report.live.battery_soc),
          grid: this.sum(sum.live?.grid, report.live.grid),
          pv: this.sum(sum.live?.pv, report.live.pv),
        };
      }

      if (report.today) {
        sum.today = {
          co2_saved: this.sum(sum.today?.co2_saved, report.today.co2_saved),
          coal_saved: this.sum(sum.today?.coal_saved, report.today.coal_saved),
          electricity_cost: this.sum(
            sum.today?.electricity_cost,
            report.today.electricity_cost
          ),
          electricity_earnings: this.sum(
            sum.today?.electricity_earnings,
            report.today.electricity_earnings
          ),
          grid_consumption: this.sum(
            sum.today?.grid_consumption,
            report.today.grid_consumption
          ),
          grid_feed_in: this.sum(
            sum.today?.grid_feed_in,
            report.today.grid_feed_in
          ),
          pv: this.sum(sum.today?.pv, report.today.pv),
          trees_planted: this.sum(
            sum.today?.trees_planted,
            report.today.trees_planted
          ),
        };
      }

      if (report.week) {
        sum.week = {
          autarchy: this.sumForWeekMeasurements(
            sum.week?.autarchy,
            report.week.autarchy
          ),
          grid_consumption: this.sumForWeekMeasurements(
            sum.week?.grid_consumption,
            report.week.grid_consumption
          ),
          grid_feed_in: this.sumForWeekMeasurements(
            sum.week?.grid_feed_in,
            report.week.grid_feed_in
          ),
          pv: this.sumForWeekMeasurements(sum.week?.pv, report.week.pv),
        };
      }

      return sum;
    }, {});

    return report_for_all_projects;
  }

  private setReportData(measurementsForCurrentProject: any) {
    if (this.token && this.userData) {
      let requests: Record<string, Observable<any>> = {};

      Object.keys(this.reports)
        .filter((projectId) => projectId !== this.userData?.project_id)
        .map((projectId) => {
          requests[projectId] = this.moduleDataService.getAllMeasurements(
            {
              ...this.userData,
              project_id: projectId,
            } as UserData,
            this.token
          );
        });

      combineLatest(requests).subscribe((measurements) => {
        if (this.userData) {
          let report_for_current_project = {};

          const allVariables = Object.entries(this.reports).map(
            ([projectId, report]) => {
              if (this.userData?.project_id === projectId) {
                report_for_current_project = this.mapReportsForOneProject(
                  report,
                  measurementsForCurrentProject
                );

                return report_for_current_project;
              }

              return this.mapReportsForOneProject(
                report,
                measurements[projectId]
              );
            }
          );

          const report_for_all_projects =
            this.sumUpForAllProjects(allVariables);

          const currentReport = this.reports[this.userData.project_id];

          const rp_live_variables = {
            battery_soc: currentReport.live?.battery_soc,
            grid: currentReport.live?.grid,
            pv: currentReport.live?.pv,
          };

          this.moduleDataService.sendNewData({
            report_for_all_projects,
            report_for_current_project,
            rp_live_variables,
          });
        }
      });
    }
  }

  setOutdoorTemperature(token: string): void {
    if (this.userData) {
      this.moduleDataService
        .getProjectInfo(this.userData, token)
        .subscribe((info) => {
          if (this.userData && info && info.meta && info.meta.location) {
            this.moduleDataService
              .getWeatherIcon(
                this.userData,
                token,
                info.meta.location.lat,
                info.meta.location.lon
              )
              .subscribe((weather) => {
                let ws_current_outdoor_temperature: OutdoorWeather = {};
                if (weather) {
                  if (weather.main) {
                    ws_current_outdoor_temperature.temperature =
                      weather.main.temp ?? 0;
                  }
                  if (weather.weather && weather.weather.length) {
                    ws_current_outdoor_temperature.icon =
                      weather.weather[0].icon ?? '';
                  }
                }

                this.moduleDataService.sendNewData({
                  ws_current_outdoor_temperature,
                });
              });
          }
        });
    }
  }

  getMeasurementsSum(measurements: any, module?: string[]): number {
    let data = 0;
    if (this.userData && module && measurements && module.length) {
      module.map((id: string) => {
        data += measurements[id] ?? 0;
      });

      data = Math.round(data);
      return data;
    }
    return 0;
  }

  getMeasurementsAverage(measurements: any, module?: string[]): number {
    const sum = this.getMeasurementsSum(measurements, module);
    return Math.round(sum / (module?.length ?? 1));
  }

  getNumberOfLoadingCars(measurements: any) {
    let data = 0;
    if (this.userData && this.userData.cs_aggregated_current_connected_cars) {
      const module = this.userData.cs_aggregated_current_connected_cars;
      if (measurements && module.length) {
        module.map((id) => {
          if (measurements[id] === 3) {
            data += 1;
          }
        });

        return data;
      }
    }
    return 0;
  }

  calculateChargedEnergy(token: string): void {
    const module = this.userData?.cs_aggregated_charged_energy;
    const start = this.getStartOf('year');
    const observables = this.calculateChartMeasurements(token, start, module);

    combineLatest(observables).subscribe((data: number[][][]) => {
      const overall = Math.round(this.sumUpArrayOfArrays(data));
      const startOfToday = this.getStartOf('day');
      const today = this.sumUpForSpecificDay(startOfToday, data);

      this.moduleDataService.sendNewData({
        cs_aggregated_charged_energy: { overall, today },
      });
    });
  }

  calculatePvPower(token: string): void {
    const module = this.userData?.pv_power;
    const start = this.getStartOf('year');
    const observables = this.calculateChartMeasurements(token, start, module);

    combineLatest(observables).subscribe((data: number[][][]) => {
      const overall = Math.round(this.sumUpArrayOfArrays(data));
      const startOfToday = this.getStartOf('day');
      const today = this.sumUpForSpecificDay(startOfToday, data);

      const lastThreeDays = [];
      lastThreeDays.push(
        this.sumUpForSpecificDay(startOfToday - 24 * 60 * 60, data)
      );
      lastThreeDays.push(
        this.sumUpForSpecificDay(startOfToday - 24 * 60 * 60 * 2, data)
      );
      lastThreeDays.push(
        this.sumUpForSpecificDay(startOfToday - 24 * 60 * 60 * 3, data)
      );

      this.moduleDataService.sendNewData({
        pv_aggregated_power: { overall, today, lastThreeDays },
      });
    });
  }

  sumUpForSpecificDay(time: number, data: number[][][]): number {
    let sum = 0;
    data.map((variable) => {
      if (variable.length) {
        const day = variable.find((measurement) => measurement[0] === time);
        if (day) {
          sum += day[1];
        }
      }
    });
    return Math.round(sum);
  }

  getStartOf(unitOfTime: 'year' | 'day'): number {
    if (this.userData) {
      return moment().tz(this.userData.timezone).startOf(unitOfTime).unix();
    }
    return moment().startOf(unitOfTime).unix();
  }

  sumUpArrayOfArrays(res: number[][][]): number {
    const sum = res.reduce((sum: number, arr: number[][]) => {
      return (
        sum +
        arr.reduce((arrSum: number, item: number[]) => {
          if (item.length && item[1] != null) {
            return arrSum + item[1];
          }
          return arrSum;
        }, 0)
      );
    }, 0);
    return sum;
  }

  calculateChartMeasurements(
    token: string,
    start: number,
    module?: string[]
  ): Observable<any>[] {
    if (this.userData && module && token) {
      let observables: Observable<any>[] = [];
      module.map((id: string) => {
        if (this.userData) {
          observables.push(
            this.moduleDataService.getChartForMeasurementId(
              id,
              this.userData,
              token,
              this.getParamsForChart(start)
            )
          );
        }
      });

      return observables;
    }

    return [];
  }

  getParamsForChart(start: number): ChartParams {
    const now = Math.floor(Date.now() / 1000);
    return {
      start: start,
      end: now,
      agg: 'integral',
      tz: this.userData ? this.userData.timezone : 'Europe/Vienna',
      int: '1d',
    };
  }

  ngOnDestory() {
    clearInterval(this.interval);
  }
}
