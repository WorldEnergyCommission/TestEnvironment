<template>
  <CoreButton button-type="delete" v-bind="$attrs">
    {{ $t("uiComponents.buttons.delete") }}
  </CoreButton>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>
