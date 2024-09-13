<template>
  <div class="d-flex justify-space-between flex-wrap" style="width: 100%">
    <div>
      <lynus-icon :color="iconColorName" :name="icon" :size="size" />
    </div>
    <div>
      <lynus-icon :size="size" color="theme" name="members" />
      <span class="pl-2" style="color: rgb(var(--v-theme-lynusText))">{{ membersCount }}</span>
    </div>
    <div>
      <lynus-icon :size="size" color="theme" name="devices" />
      <span class="pl-2" style="color: rgb(var(--v-theme-lynusText))">{{ devicesCount }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  components: {},
  props: {
    icon: { default: "", type: String },
    iconColorName: { default: "", type: String },
    membersCount: { default: 0, type: Number },
    devicesCount: { default: 0, type: Number },
    size: { default: 0, type: Number },
  },
});
</script>
