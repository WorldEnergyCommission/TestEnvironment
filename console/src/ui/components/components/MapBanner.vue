<template>
  <CoreCard
    v-resize:throttle="fitMapToMarkers"
    :height="mapHeight"
    class="map-banner"
    @click="isMapExpanded = true"
  >
    <div v-if="showMap" style="height: 100%; width: 100%">
      <l-map
        ref="mapBanner"
        v-model:zoom="zoom"
        v-model:center="center"
        :options="mapOptions"
        :world-copy-jump="true"
        @ready="fitMapToMarkers()"
      >
        <MapLegend />
        <l-tile-layer
          :attribution="attribution"
          :no-wrap="false"
          :options="titleLayerOptions"
          :url="url"
        />
        <l-marker
          v-for="(group, index) in groupedMarkerArr"
          :key="index"
          :icon="icons[group.status]"
          :lat-lng="group.coords"
          :visible="group.visible"
        >
          <l-popup>
            <div class="marker-tooltip">
              <div
                v-for="(project, projectIndex) in group.projects"
                :key="projectIndex"
                class="marker-tooltip-item"
                @click="handleTooltip(project, group)"
              >
                <h2>{{ project.name }}</h2>
                <p>{{ project.meta.description }}</p>
              </div>
            </div>
          </l-popup>
        </l-marker>
      </l-map>
    </div>
  </CoreCard>
</template>

<script lang="ts">
import "leaflet/dist/leaflet.css";
import { LMap, LMarker, LPopup, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { icon, LatLng, latLng, LatLngExpression, polygon } from "leaflet";
import { defineComponent, ref } from "vue";

import MapLegend from "./MapLegend.vue";
import { IProject } from "@/store/modules/projects/types";
import { envDarkMapboxStyleId, envLightMapboxStyleId } from "@/utils/env";

/**
 * Component that represent map on Home page
 */
export default defineComponent({
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    MapLegend,
  },
  setup() {
    const mapBanner = ref(null);
    return {
      mapBanner,
      url: "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      mapOptions: {
        zoomSnap: 0.5,
      },
      icons: {
        error: icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
        ok: icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
        suspend: icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      },
    };
  },
  data() {
    const intervalVar: any = undefined;
    const groupedMarkerArr: {
      coords: LatLng;
      status: "error" | "suspend" | "ok";
      visible: boolean;
      projects: IProject[];
    }[] = [];

    return {
      zoom: 11,
      isMapExpanded: false,
      groupedMarkerArr,
      intervalVar,
      showMap: false,
      center: new LatLng(48.21, 16.36),
    };
  },
  computed: {
    titleLayerOptions() {
      return {
        id: this.$vuetify.theme.current.dark ? envDarkMapboxStyleId : envLightMapboxStyleId,
        accessToken:
          "pk.eyJ1IjoibWF0dHJpZXMiLCJhIjoiY20xMzhubWZvMTJubTJscjNydGIyMGl2diJ9.tqeXc85uAR_iM6zZFWN8og",
        tileSize: 256,
      };
    },
    mapHeight() {
      if (this.$vuetify.display.mobile && !this.isMapExpanded) {
        return "20dvh";
      }
      return "40dvh";
    },
    filteredProjectsByCoords() {
      return this.projects.filter(
        (project) => project.meta && project.meta.location && project.meta.location,
      );
    },
    projectsCoords() {
      return this.filteredProjectsByCoords.map((project: any) => project.meta.location);
    },
    uniqueCoords() {
      return this.projectsCoords.filter(
        (item: any, index: number) =>
          this.projectsCoords.findIndex(
            (obj: any) => obj.lat === item.lat && obj.lon === item.lon,
          ) === index,
      );
    },
    projects(): IProject[] {
      return this.$store.getters["projects/projects"];
    },
  },
  watch: {
    projectsCoords: [
      {
        handler: "initProjectsGroups",
      },
    ],
    projects: [
      {
        handler: "fitMapToMarkers",
      },
    ],
    "$vuetify.display.mobile": [
      {
        handler: "fitMapToMarkers",
      },
    ],
    isMapExpanded: [
      {
        handler: "fitMapToMarkers",
      },
    ],
    groupedMarkerArr: [
      {
        handler: "fitMapToMarkers",
      },
    ],
  },
  async mounted() {
    // delay showing of map due to unknown bug
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.showMap = true;

    await this.initProjectsGroups();

    // updates project groups every 60 seconds
    this.intervalVar = setInterval(async () => {
      await this.initProjectsGroups();
    }, 60000);
  },
  unmounted() {
    clearInterval(this.intervalVar);
  },
  methods: {
    handleTooltip(project: any, group: any) {
      if (group.status !== "ok") {
        this.$router.push({ path: `/projects/${project.id}/eventlist` });
      } else {
        this.$router.push({ path: `/projects/${project.id}/favorites` });
      }
    },
    /**
     * Group projects which has equal coordinates
     */
    async initProjectsGroups() {
      this.groupedMarkerArr = [];
      this.uniqueCoords.forEach((item: any) => {
        const projects = this.filteredProjectsByCoords.filter((project: any) => {
          const { location } = project.meta;
          return item.lat === location.lat && item.lon === location.lon;
        });
        let errors = 0;
        let warnings = 0;
        projects
          .map((i: any) => i.stats)
          .forEach((el: any) => {
            errors += el.errors;
            warnings += el.warnings;
          });
        const getStatus = () => {
          if (errors) return "error";
          if (!errors && warnings) return "suspend";
          return "ok";
        };
        const newItem = {
          coords: latLng(item.lat, item.lon),
          status: getStatus() as "error" | "suspend" | "ok",
          visible: true,
          projects,
        };
        if (newItem.coords) {
          this.groupedMarkerArr.push(newItem);
        }
      });
      this.fitMapToMarkers();
    },
    fitMapToMarkers() {
      if (this.groupedMarkerArr.length === 0) return;
      const latlngs: LatLngExpression[] = this.groupedMarkerArr.map((marker) => marker.coords);

      const poly = polygon(latlngs);

      const map = (this.mapBanner as any)?.leafletObject;
      if (map) {
        map.fitBounds(poly.getBounds());
        if (this.groupedMarkerArr.length === 1) map.setZoom(11);
      }
    },
    loadProjectStats(id: string): Promise<any> {
      return this.$store.dispatch("projects/loadProjectStats", id);
    },
  },
});
</script>

<style lang="scss">
.map-banner {
  border-radius: 10px !important;
  overflow: hidden;
  z-index: 0;

  .leaflet-control-zoom {
    a {
      color: black;
    }
  }

  .marker-tooltip {
    max-height: 250px;

    .marker-tooltip-item {
      cursor: pointer;
      padding: 5px 10px;

      &:hover {
        background: #f1f1f1;
      }

      &:hover > h2 {
        color: #2196f3;
      }

      h2 {
        margin: 0;
      }

      p {
        margin: 0;
      }
    }
  }
}
</style>
