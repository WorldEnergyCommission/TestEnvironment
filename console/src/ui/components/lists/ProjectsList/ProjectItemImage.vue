<template>
  <CoreImage
    v-if="imageId != ''"
    :src="`https://static.${domain}/assets/${imageId}`"
    :height="height"
  >
    <template #placeholder>
      <div style="display: flex; align-items: center; flex-direction: column">
        <PlaceHolderImage :height="height" style="width: 80%" />
        <CoreOverlay
          :absolute="true"
          class="align-center justify-center"
          contained
          persistent
          scroll-strategy="none"
        >
          <CoreProgressCircular indeterminate />
        </CoreOverlay>
      </div>
    </template>
  </CoreImage>
  <PlaceHolderImage v-else :height="height" style="width: 80%" />
</template>
<script lang="ts">
import { defineComponent } from "vue";

import PlaceHolderImage from "@/ui/components/components/PlaceHolderImage.vue";
import { envDomain } from "@/utils/env";

export default defineComponent({
  components: {
    PlaceHolderImage,
  },
  props: {
    imageId: { default: "", type: String },
    height: { default: 245, type: Number },
  },
  data() {
    const domain: string = envDomain;

    return {
      domain,
    };
  },
});
</script>
