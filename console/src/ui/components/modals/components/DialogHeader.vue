<template>
  <!--   header   -->
  <div class="dialog-header-border-radius dialog-header">
    <h2>{{ title ? $t(title) : "" }}</h2>
    <div>
      <CoreButton height="30" button-type="standardIcon" width="30" @click="$emit('click')">
        <lynus-icon color="lynusText" name="x-in-circle" />
      </CoreButton>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  props: ["title"],
  emits: ["click"],
};
</script>
<style lang="scss" scoped>
@import "./src/ui/scss/variables";

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: rgb(var(--v-theme-primary-lighten-1));

  h2 {
    font-size: 30px;
    line-height: 1;
  }
}

.v-theme--light {
  .dialog-header {
    background-color: rgb(var(--v-theme-secondaryDeviceBackground-lighten-1));
  }
}

.dialog-header-border-radius {
  border-radius: $border-radius-root;
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}
</style>
