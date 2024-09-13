<template>
  <div class="w-100 h-100">
    <CoreColumn class="px-0" style="overflow: auto">
      <DataMappingsTable class="w-100" />
    </CoreColumn>
  </div>
</template>
<script lang="ts" setup>
import DataMappingsTable from "@/ui/components/tables/workbench/DataMappingsTable.vue";
</script>
