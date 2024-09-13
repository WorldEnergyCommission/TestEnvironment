<template>
  <div>Hello</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";

export default defineComponent({
  components: {},
  props: {
    deviceData: {
      type: Object as PropType<IDevice>,
    },
  },
  created() {
    console.log("hello world");
  },
});
</script>

<style lang="scss" scoped></style>
