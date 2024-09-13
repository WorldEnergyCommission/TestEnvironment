<template>
  <CoreIcon :color="activeColor" size="small"> icon-{{ icon }} </CoreIcon>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: ["icon"],
  data() {
    const timer: any = null;

    return {
      activeColor: "",
      timer,
    };
  },
  mounted() {
    this.timer = setInterval(() => {
      this.activeColor = this.activeColor ? "" : "red";
    }, 1000);
  },
  unmounted(): void {
    clearInterval(this.timer);
  },
});
</script>

<style lang="scss" scoped></style>
