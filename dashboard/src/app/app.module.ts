import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { PvAggregatedCurrentPowerModule } from './modules/pv-aggregated-current-power/pv-aggregated-current-power.module';
import { PvAggregatedProducedEnergyLastThreeDaysModule } from './modules/pv-aggregated-produced-energy-last-three-days/pv-aggregated-produced-energy-last-three-days.module';
import { PvAggregatedProducedEnergyPredictionNextDayModule } from './modules/pv-aggregated-produced-energy-prediction-next-day/pv-aggregated-produced-energy-prediction-next-day.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WsAverageRoomTemperatureModule } from './modules/ws-average-room-temperature/ws-average-room-temperature.module';
import { WsAverageRoomHumidityModule } from './modules/ws-average-room-humidity/ws-average-room-humidity.module';
import { WsCurrentOutdoorTemperatureModule } from './modules/ws-current-outdoor-temperature/ws-current-outdoor-temperature.module';
import { PvAggregatedCarbonSavingsModule } from './modules/pv-aggregated-carbon-savings/pv-aggregated-carbon-savings.module';
import { PvAggregatedCarbonSavingsSymbolicModule } from './modules/pv-aggregated-carbon-savings-symbolic/pv-aggregated-carbon-savings-symbolic.module';
import { CsAggregatedCurrentConnectedCarsModule } from './modules/cs-aggregated-current-connected-cars/cs-aggregated-current-connected-cars.module';
import { CsAggregatedChargedEnergyModule } from './modules/cs-aggregated-charged-energy/cs-aggregated-charged-energy.module';
import { PvAggregatedCurrentPowerSymbolicModule } from './modules/pv-aggregated-current-power-symbolic/pv-aggregated-current-power-symbolic.module';
import { AdsComponent } from './modules/ads/ads.component';
import { FullDatePipe } from './dashboard/fullDate.pipe';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModulesComponent } from './modules/modules.component';
import { TextFieldModule } from './modules/text-field/text-field.module';
import { LastSevenDaysChartModule } from './modules/last-seven-days-chart/last-seven-days-chart.module';
import { RpTodayGridConsumptionModule } from './modules/rp-today-grid-consumption/rp-today-grid-consumption.module';
import { CurrentGridPowerModule } from './modules/current-grid-power/current-grid-power.module';
import { ProjectStateOverviewModule } from './modules/project-state-overview/project-state-overview.module';
import { TodayOverviewModule } from './modules/today-overview/today-overview.module';
import { CurrentPowerModule } from './modules/current-power/current-power.module';
import { CurrentValueModule } from './modules/current-value/current-value.module';

const routes: Routes = [
  {
    path: '',
    component: AppComponent,
  },
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    AdsComponent,
    FullDatePipe,
    ModulesComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    PvAggregatedCurrentPowerModule,
    PvAggregatedProducedEnergyLastThreeDaysModule,
    PvAggregatedProducedEnergyPredictionNextDayModule,
    WsAverageRoomTemperatureModule,
    WsAverageRoomHumidityModule,
    WsCurrentOutdoorTemperatureModule,
    PvAggregatedCarbonSavingsModule,
    PvAggregatedCarbonSavingsSymbolicModule,
    CsAggregatedCurrentConnectedCarsModule,
    CsAggregatedChargedEnergyModule,
    PvAggregatedCurrentPowerSymbolicModule,
    BrowserAnimationsModule,
    TextFieldModule,
    LastSevenDaysChartModule,
    RpTodayGridConsumptionModule,
    CurrentGridPowerModule,
    ProjectStateOverviewModule,
    TodayOverviewModule,
    CurrentPowerModule,
    CurrentValueModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
