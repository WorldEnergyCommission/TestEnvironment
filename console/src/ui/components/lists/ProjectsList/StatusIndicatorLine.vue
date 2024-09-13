<template>
  <div class="status-indicator-line d-flex justify-center align-center">pending</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    status: { default: Boolean(), type: Boolean },
  },
});
</script>

<style lang="scss" scoped>
.status-indicator-line {
  background: #dedede;
  color: #fff;
  height: 30px;
  font-size: 1rem;
  @media (max-width: 960px) {
    height: 20px;
    font-size: 0.8rem;
  }
}

.online {
  background: green;
}
</style>
