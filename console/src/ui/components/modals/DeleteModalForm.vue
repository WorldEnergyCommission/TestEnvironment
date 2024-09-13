<template>
  <CoreDialog v-model="dialog" max-width="300" persistent>
    <template #activator="{ props }">
      <span v-bind="props">
        <slot />
      </span>
    </template>

    <CoreCard style="border-radius: 20px">
      <CoreToolbar flat>
        <CoreToolbarTitle>
          {{ $t("modals.deleteModal.title") }}
        </CoreToolbarTitle>
        <CoreSpacer />
        <CoreButton button-type="standardIcon" @click="dialog = false">
          <CoreIcon>mdi:mdi-close</CoreIcon>
        </CoreButton>
      </CoreToolbar>

      <CoreContainer fluid>
        <CoreRow>
          <CoreColumn class="text-center">
            <img :src="`/assets/delete.png`" alt="delete" width="50" />
          </CoreColumn>
        </CoreRow>
        <CoreRow>
          <CoreColumn class="text-center">
            <p>{{ $t("modals.deleteModal.text", { name: deletedItemName }) }}?</p>
          </CoreColumn>
        </CoreRow>
      </CoreContainer>

      <CoreCardActions>
        <CoreSpacer />
        <CoreButton button-type="secondary" @click="dialog = false">
          {{ $t("modals.deleteModal.btnNo") }}
        </CoreButton>
        <CoreButton button-type="primary" @click="handleDelete">
          {{ $t("modals.deleteModal.btnYes") }}
        </CoreButton>
      </CoreCardActions>
    </CoreCard>
  </CoreDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

/**
 * Component that allows to delete project/devices et.c
 */
export default defineComponent({
  props: {
    deletedItemName: { default: "", type: String },
  },
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    handleDelete() {
      this.$emit("deleteHandler");
      this.dialog = false;
    },
  },
});
</script>

<style lang="scss" scoped></style>
