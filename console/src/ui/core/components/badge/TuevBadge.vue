<template>
  <div class="tuv-badge">
    <img :src="sideBarBadge" crossorigin="use-credentials" :width="200" />
  </div>
</template>

<script setup lang="ts">
import { sideBarBadge } from "@/utils/env";
</script>

<style lang="scss" scoped>
.tuv-badge {
  display: flex;
  justify-content: center;
}
</style>
