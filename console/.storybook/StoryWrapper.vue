<template>
  <CoreApp :theme="themeName" style="padding: 20px; height: 100%; min-height: 100vh">
    <CoreMain>
      <slot name="story"></slot>
    </CoreMain>
  </CoreApp>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { CoreApp } from "@/ui/core/components";
import { CoreMain } from "@/ui/core/components";

export default defineComponent({
  components: {
    CoreApp,
    CoreMain,
  },
  props: {
    themeName: String,
  },
});
</script>
