<template>
  <CoreCard class="api-documentation">
    <div class="api-documentation-title">
      {{ $t("uiComponents.documentation.api.title") }}
    </div>
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({});
</script>

<style lang="scss" scoped>
.api-documentation {
  .api-documentation-title {
    font-size: 20px;
    padding-top: 20px;
  }
}
</style>
