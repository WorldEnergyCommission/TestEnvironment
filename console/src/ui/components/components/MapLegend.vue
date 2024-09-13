<template>
  <l-control
    :position="$vuetify.display.mobile ? 'topright' : 'bottomright'"
    class="legend-watermark pa-2"
  >
    <CoreRow align="center" class="legend-content">
      <CoreColumn class="pe-1">
        <CoreImage
          :width="11"
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
        />
      </CoreColumn>
      <CoreColumn class="ps-0">
        {{ $t("uiComponents.map.error") }}
      </CoreColumn>
      <CoreColumn class="pe-1">
        <CoreImage
          :width="11"
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png"
        />
      </CoreColumn>
      <CoreColumn class="ps-0">
        {{ $t("uiComponents.map.warning") }}
      </CoreColumn>
      <CoreColumn class="pe-1">
        <CoreImage
          :width="11"
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
        />
      </CoreColumn>
      <CoreColumn class="ps-0">
        {{ $t("uiComponents.map.ok") }}
      </CoreColumn>
    </CoreRow>
  </l-control>
</template>

<script lang="ts">
import { LControl } from "@vue-leaflet/vue-leaflet";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    LControl,
  },
});
</script>

<style lang="scss" scoped>
.legend-watermark {
  background-color: #aaa;
  opacity: 0.7;
  padding: 3px;
  border-radius: 3px;
}

.legend-content {
  opacity: 1;
}
</style>
