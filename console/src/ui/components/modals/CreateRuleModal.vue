<template>
  <FormModal>
    <template #activator>
      <TopBarAddButton :text="$t('uiComponents.rules.addRule')" />
    </template>
    <template #content="{ hide }">
      <RuleForm :is-new="true" @dismiss="hide()" />
    </template>
  </FormModal>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import TopBarAddButton from "@/ui/components/components/TopBarAddButton.vue";
import RuleForm from "@/ui/components/forms/Rules/RuleForm.vue";
import FormModal from "@/ui/components/modals/FormModal.vue";

export default defineComponent({
  components: {
    TopBarAddButton,
    FormModal,
    RuleForm,
  },
});
</script>
