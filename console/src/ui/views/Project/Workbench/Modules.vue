<template>
  <div class="w-100 h-100">
    <CoreColumn class="px-0" style="overflow: auto">
      <ModulesTable class="w-100" />
    </CoreColumn>
  </div>
</template>
<script lang="ts" setup>
import ModulesTable from "@/ui/components/tables/workbench/ModulesTable.vue";
</script>
