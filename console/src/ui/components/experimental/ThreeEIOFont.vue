<script setup>
import { Text3D, vAlwaysLookAt } from "@tresjs/cientos";
</script>

<template>
  <Text3D
    ref="textRef"
    v-always-look-at="camera"
    :position="position"
    font="https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json"
    need-updates
  >
    {{ text }}
    <TresMeshStandardMaterial color="#0e8c58" />
  </Text3D>
</template>
