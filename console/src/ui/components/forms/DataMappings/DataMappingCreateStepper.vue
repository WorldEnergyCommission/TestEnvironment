<template>
  <DataMappingTypeSelectStep v-if="!fromView" v-model="type" @selected="fromView = true" />
  <DataMappingForm v-else :type="type" @finished="$emit('dismiss')" @back="fromView = false" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import DataMappingForm from "./DataMappingForm.vue";
import DataMappingTypeSelectStep from "./DataMappingTypeSelectStep.vue";
import { DataMappingType } from "@/store/modules/dataMappings/types";

export default defineComponent({
  components: {
    DataMappingForm,
    DataMappingTypeSelectStep,
  },
  data() {
    const type: DataMappingType = {
      name: "",
      id: "",
    };

    return {
      type,
      fromView: false,
    };
  },
});
</script>
