<template>
  <CoreSnackbar
    v-model="value"
    :color="getReportMessageAndType.type"
    :timeout="2000"
    content-class="curved-display-margin"
    rounded="pill"
  >
    <div class="report-message-content">
      {{ getReportMessageAndType.message }}
    </div>
    <template #actions>
      <CoreButton button-type="standardIcon" @click="value = false">
        <lynus-icon color="white" name="x" />
      </CoreButton>
    </template>
  </CoreSnackbar>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { RootState } from "@/store/types";

/**
 * Component that represent notification message
 * Usually see when do some request to API
 */
export default defineComponent({
  computed: {
    appState() {
      return (this.$store.state as RootState).app;
    },
    value: {
      get() {
        return this.appState.reportBox.value;
      },
      set(val: any) {
        this.setReport({ message: "", value: val });
      },
    },
    getReportMessageAndType(): any {
      return this.$store.getters["app/getReportMessageAndType"];
    },
  },
  methods: {
    setReport(payload: any) {
      this.$store.commit("app/setReport", payload);
    },
  },
});
</script>
<style lang="scss">
@import "./src/ui/scss/variables";

.report-message-content {
  font-family: $body-font-family !important;
  font-size: 20px !important;
}
</style>
