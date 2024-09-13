<template>
  <CoreRow>
    <CoreColumn cols="12" md="3" order="2" order-md="1">
      <CoreCard
        class="w-100 h-100 pa-3 d-flex flex-column justify-content-around"
        elevated-card
        color="sideBarColor-lighten-1"
      >
        <CoreRow class="w-100 h-100 pa-3" :dense="$vuetify.display.mobile">
          <CoreColumn cols="3" class="pe-0 text-end">
            <CoreIcon size="small" color="accent"> fas fa-location-dot </CoreIcon>
          </CoreColumn>
          <CoreColumn cols="9">
            <div class="font-weight-bold">
              {{ locationData }}
            </div>
          </CoreColumn>
          <CoreColumn cols="3" />
          <CoreColumn cols="9">
            <div>{{ currentDate }}</div>
          </CoreColumn>
        </CoreRow>
      </CoreCard>
    </CoreColumn>
    <CoreColumn cols="12" md="6" order="1" order-md="2">
      <CoreCard
        class="w-100 h-100 pa-3 d-flex flex-column align-center"
        elevated-card
        color="sideBarColor-lighten-1"
      >
        <CoreRow class="pa-0 w-100 h-100">
          <CoreColumn class="d-flex align-center justify-center pa-0" cols="6" md="3">
            <img
              v-if="weatherObject.icon.startsWith('0') || weatherObject.icon.startsWith('1')"
              :src="`/assets/images/weather/${weatherObject.icon}.png`"
              :width="128"
              :height="128"
            />
            <CoreIcon v-else :size="$vuetify.display.mobile ? 30 : 45">
              fas {{ weatherIcon }}
            </CoreIcon>
          </CoreColumn>
          <CoreColumn cols="6" md="3">
            <div class="d-flex flex-column justify-center align-center w-100 h-100">
              <h1>{{ currentTemperature }} &deg;C</h1>
              <div class="text-caption">
                {{ $t("uiComponents.generalInfoBanner.outdoor") }}
              </div>
            </div>
          </CoreColumn>

          <CoreColumn cols="12" md="6" :class="$vuetify.display.mobile ? 'pt-0' : ''">
            <div class="d-flex flex-column justify-space-around w-100 h-100">
              <div class="d-flex align-center">
                <img :src="`/assets/images/weather/waterdrop.png`" :width="16" />
                <span class="mr-2 ml-4 text-medium">
                  {{ weatherData.main.humidity || "..." }} %
                </span>
                <span class="text-caption">{{
                  $t("uiComponents.generalInfoBanner.humidity")
                }}</span>
              </div>
              <div class="d-flex align-center">
                <img :src="`/assets/images/weather/windspeed.png`" :width="16" />
                <span class="mr-2 ml-4 text-medium">
                  {{ weatherData.wind.speed || "..." }} km/h
                </span>
                <span class="text-caption">{{
                  $t("uiComponents.generalInfoBanner.windSpeed")
                }}</span>
              </div>
            </div>
          </CoreColumn>
        </CoreRow>
      </CoreCard>
    </CoreColumn>
    <CoreColumn cols="12" md="3" order="3">
      <CoreCard class="w-100 h-100 pa-3" color="sideBarColor-lighten-1" elevated-card>
        <CoreRow class="pa-0">
          <CoreColumn
            v-for="item in forecasts"
            :key="item.time"
            class="d-flex align-center justify-center flex-column"
            cols="3"
          >
            <span class="text-caption"> {{ item.dateFormated }} </span>
            <img
              v-if="item.icon.startsWith('0') || item.icon.startsWith('1')"
              :src="`/assets/images/weather/${item.icon}.png`"
              :width="64"
              :height="64"
            />
            <CoreIcon v-else :size="$vuetify.display.mobile ? 30 : 45">
              fas {{ weatherIcon }}
            </CoreIcon>
            <span class="font-weight-bold"> {{ item.temp }} &deg;C</span>
          </CoreColumn>
        </CoreRow>
      </CoreCard>
    </CoreColumn>
  </CoreRow>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";

import { IProject } from "@/store/modules/projects/types";
import { RootState } from "@/store/types";

const store = useStore();
const { d, t, locale } = useI18n();

const appState = computed(() => {
  return (store.state as RootState).app;
});

const weatherData = computed(() => {
  return appState.value.weatherData || { main: {}, wind: {} };
});

const weatherForecastData = computed(() => {
  return appState.value.weatherForecastData || { main: {}, wind: {} };
});

const forecasts = computed(() => {
  if (
    !weatherForecastData.value ||
    !weatherForecastData.value.list ||
    weatherForecastData.value.list.length < 4
  )
    return [];

  const firstElements = weatherForecastData.value.list.slice(0, 4);
  const dateOptions = {
    hour: "numeric",
    minute: "numeric",
  };
  return firstElements.map((element) => ({
    icon: element.weather[0].icon,
    temp: Math.round(element.main.temp),
    time: element.dt,
    dateFormated: new Intl.DateTimeFormat(locale.value, dateOptions).format(
      new Date(element.dt * 1000),
    ),
  }));
});

const currentTemperature = computed(() => {
  if (weatherData.value.main.temp) return Math.round(weatherData.value.main.temp);
  return "...";
});

const currentDate = computed(() => {
  const d2 = new Date();
  return d(d2, "long");
});

const locationData = computed(() => {
  if ((project.value?.meta?.location as any)?.display_name) {
    return (project.value.meta?.location as any).display_name.split(",")[0];
  }
  return "";
});

const project = computed((): IProject => {
  return (store.state as RootState).projects.project;
});

// weather icon using font awesome (currently not used)
const weatherIcon = computed((): string => {
  if (200 <= weatherObject.value.id && weatherObject.value.id < 300) {
    return "fa-cloud-bolt";
  }
  if (300 <= weatherObject.value.id && weatherObject.value.id < 400) {
    return "fa-cloud-rain";
  }
  if (500 <= weatherObject.value.id && weatherObject.value.id < 600) {
    return "fa-cloud-sun-rain";
  }
  if (600 <= weatherObject.value.id && weatherObject.value.id < 700) {
    return "fa-snowflake";
  }
  if (700 <= weatherObject.value.id && weatherObject.value.id < 800) {
    return "fa-smog";
  }
  if (800 === weatherObject.value.id) {
    return "fa-sun";
  }
  if (801 === weatherObject.value.id) {
    return "fa-cloud-sun";
  }
  if (802 <= weatherObject.value.id && weatherObject.value.id < 900) {
    return "fa-cloud";
  }
  return "fa-rainbow";
});

const weatherObject = computed(
  (): {
    icon: string;
    main: string;
    id: number;
  } => {
    if (!weatherData.value.weather) {
      return { icon: "", main: "", id: 0 };
    }
    return weatherData.value.weather[0];
  },
);
</script>

<style lang="scss" scoped></style>
