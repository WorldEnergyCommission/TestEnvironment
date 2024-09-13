<template>
  <SelectModule v-if="!fromView" v-model="type" @selected="fromView = true" />
  <ModuleForm v-else :type="type" @finished="$emit('dismiss')" @back="fromView = false" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { ModuleType } from "@/store/modules/modules/types";
import ModuleForm from "@/ui/components/forms/Modules/ModuleForm.vue";
import SelectModule from "@/ui/components/forms/Modules/SelectModule.vue";

export default defineComponent({
  components: {
    SelectModule,
    ModuleForm,
  },
  data() {
    const type: ModuleType = {
      name: "",
      id: "",
      type: "",
      type_id: "",
      created_at: "",
      project_id: "",
      collection_id: "",
      properties: [],
    };

    return {
      type,
      fromView: false,
    };
  },
});
</script>
