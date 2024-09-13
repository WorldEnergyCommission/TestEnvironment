<template>
  <Suspense>
    <GLTFModel
      path="/assets/three/solar/scene.gltf"
      cast-shadow
      receive-shadow
      :position="position ?? [0.0, 0.0, 0.0]"
    />
  </Suspense>
</template>
<script lang="ts" setup>
import { GLTFModel } from "@tresjs/cientos";

const props = defineProps(["position"]);
</script>
