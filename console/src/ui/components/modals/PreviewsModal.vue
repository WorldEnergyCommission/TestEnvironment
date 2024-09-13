<template>
  <FormModal :form-title="$t('uiComponents.library')" :full-height="true">
    <template #activator>
      <CoreButton
        :class="[
          'library-activator',
          { 'not-mobile': !$vuetify.display.mobile },
          { 'lynus-small-btn-double-border': !$vuetify.display.mobile },
        ]"
        :height="$vuetify.display.mobile ? '' : '180px !important'"
        location="bottom right"
        class="me-3 mb-6"
        button-type="primary"
        position="fixed"
        width="180px"
        size="x-large"
      >
        <div
          :class="[
            'd-flex',
            { 'flex-column': !$vuetify.display.mobile },
            'align-center justify-space-around',
          ]"
          style="height: 100%"
        >
          <CoreIcon
            :size="$vuetify.display.mobile ? 'small' : 'x-large'"
            color="accent"
            density="compact"
            class="mr-2"
          >
            fas fa-book-open
          </CoreIcon>
          <span>
            {{ $t("uiComponents.library") }}
          </span>
        </div>
      </CoreButton>
    </template>
    <template #content>
      <PreviewList />
    </template>
  </FormModal>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import PreviewList from "@/ui/components/lists/PreviewList.vue";
import FormModal from "@/ui/components/modals/FormModal.vue";

export default defineComponent({
  name: "PreviewsModal",
  components: {
    FormModal,
    PreviewList,
  },
});
</script>
