<template>
  <v-switch v-model="model" color="accent" inset>
    <template #label>
      <span v-if="label">{{ label }}</span>
    </template>
  </v-switch>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Properties
interface Props {
  label?: string;
}

const props = defineProps<Props>();

const model = defineModel();
</script>
