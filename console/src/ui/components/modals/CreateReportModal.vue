<template>
  <FormModal>
    <template #activator>
      <TopBarAddButton :text="$t('uiComponents.report.createReport')" />
    </template>
    <template #content="{ hide }">
      <ReportForm :is-new-report="true" @dismiss="hide()" />
    </template>
  </FormModal>
</template>
<script lang="ts">
import { defineComponent } from "vue";

import TopBarAddButton from "@/ui/components/components/TopBarAddButton.vue";
import ReportForm from "@/ui/components/forms/Report/ReportForm.vue";
import FormModal from "@/ui/components/modals/FormModal.vue";

export default defineComponent({
  components: {
    TopBarAddButton,
    FormModal,
    ReportForm,
  },
});
</script>
