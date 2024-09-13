<script setup lang="ts">
import { OrbitControls, GLTFModel, Text3D, vAlwaysLookAt } from "@tresjs/cientos";
import { TresCanvas, useRenderLoop } from "@tresjs/core";
import { VSMShadowMap, SRGBColorSpace, ReinhardToneMapping } from "three";
import { shallowRef, computed, ref } from "vue";
import { useTheme } from "vuetify";

import ThreeSolarPanel from "./ThreeSolarPanel.vue";
// import ThreeHouse from "./ThreeHouse.vue";

const { current: theme } = useTheme();

const gl = computed(() => ({
  clearColor: theme.value.colors.surface,
  shadows: true,
  alpha: false,
  shadowMapType: VSMShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: ReinhardToneMapping,
}));

const uniforms = {
  uTime: { value: 0 },
};

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision mediump float;
varying vec2 vUv;
uniform highp float uTime;


void main() {
    float cappedY = mod(vUv.y * uTime , 500.0);
    vec2 st = gl_FragCoord.xy/vUv;
    gl_FragColor.rgba = vec4(abs(sin(uTime)), 1, 0.5, 0.8);
   // gl_FragColor = vec4(0 ,mod(st.y * uTime , 5.0), 0.0, 1.0);
}
`;

const blobRef = shallowRef(null);
const { onLoop } = useRenderLoop();
onLoop(({ delta, elapsed }) => {
  if (blobRef.value) {
    blobRef.value.material.uniforms.uTime.value = elapsed * 2;
  }
});

const orbitPos = ref([-18.0, 16.0, 23.0]);
function handleOrbitEnd(args) {
  orbitPos.value = args?.object?.position;
}
</script>

<template>
  <TresCanvas v-bind="gl">
    <!-- Your scene here -->
    <TresPerspectiveCamera :position="[-18.0, 16.0, 23.0]" :rotation="[-1.0, -1.0, -1.0]" />
    <OrbitControls :make-default="true" @end="handleOrbitEnd" />
    <TresDirectionalLight :intensity="5" :position="[-10, 2, -3]" cast-shadow />
    <TresAmbientLight :intensity="1" />
    <!-- helper -->
    <!-- <TresAxesHelper />
    <TresGridHelper /> -->
    <!--- PV Panels 3d model --->
    <ThreeSolarPanel />
    <Suspense>
      <Text3D
        ref="textRef"
        v-always-look-at="orbitPos"
        :position="[0, 5, 0]"
        font="https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json"
        need-updates
      >
        12 kW
        <TresMeshStandardMaterial color="#0e8c58" />
      </Text3D>
    </Suspense>
    <Suspense>
      <GLTFModel
        path="/assets/three/house/scene.gltf"
        cast-shadow
        :position="[10.0, 0.0, 0.0]"
        :rotation="[0, 270 * (Math.PI / 180), 0]"
      />
    </Suspense>
    <Suspense>
      <Text3D
        ref="textRef"
        v-always-look-at="orbitPos"
        :position="[18.0, 10.0, 0.0]"
        font="https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json"
        need-updates
      >
        4 kW
        <TresMeshStandardMaterial color="#fc0328" />
      </Text3D>
    </Suspense>
    <TresMesh ref="blobRef" :position="[10, 0, 0]" :rotation="[0, 0, 90 * (Math.PI / 180)]">
      <TresCylinderGeometry :args="[0.1, 0.1, 20, 32]" />
      <TresShaderMaterial
        :fragment-shader="fragmentShader"
        :uniforms="uniforms"
        :vertex-shader="vertexShader"
        transparent
      />
    </TresMesh>
    <TresMesh receive-shadow :position="[0, 0, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[100, 100, 100, 100]" />
      <TresMeshStandardMaterial color="#053521" />
    </TresMesh>
  </TresCanvas>
</template>
v
