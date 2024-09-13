<template>
  <div class="billing-view pa-5">
    <PricesTable />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import PricesTable from "@/ui/components/tables/PricesTable.vue";

/**
 * Billing page that shows table of payments
 */
export default defineComponent({
  components: { PricesTable },
});
</script>
