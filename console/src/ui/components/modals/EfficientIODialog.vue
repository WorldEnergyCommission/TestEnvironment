<template>
  <CoreDialog v-model="showDialog" max-width="800" persistent>
    <template #activator="activatorProps">
      <span
        v-bind="activatorProps.props"
        @click="showDialog = true"
        @keydown.enter="showDialog = true"
      >
        <slot name="activator" :is-active="showDialog" :props="activatorProps.props" />
      </span>
    </template>
    <div class="efficientio-dialog-form" style="max-width: fit-content; margin-inline: auto">
      <DialogHeader :title="props.dialogTitle" @click="showDialog = false" />
      <CoreCard class="efficientio-dialog-form-content" card-with-bg-color>
        <CoreContainer v-if="showDialog">
          <slot name="content" :hide="() => (showDialog = false)" :is-active="showDialog" />
        </CoreContainer>
      </CoreCard>
    </div>
  </CoreDialog>
</template>
<script lang="ts" setup>
/**
 * A Dialog COmponenet
 */
import { defineModel, withDefaults } from "vue";

import DialogHeader from "@/ui/components/modals/components/DialogHeader.vue";

// Properties
interface Props {
  dialogTitle: string;
}

const props = withDefaults(defineProps<Props>(), {
  dialogTitle: "EfficientIO Modal",
});

const showDialog = defineModel<boolean>();
</script>

<style lang="scss"></style>
